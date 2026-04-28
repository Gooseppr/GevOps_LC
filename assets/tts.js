(function () {
  "use strict";

  if (!window.speechSynthesis) return;

  var synth = window.speechSynthesis;
  var player = document.getElementById("tts-player");
  var btnPlay = document.getElementById("tts-play");
  var btnPause = document.getElementById("tts-pause");
  var btnStop = document.getElementById("tts-stop");
  var statusEl = document.getElementById("tts-status");
  var speedSelect = document.getElementById("tts-speed");

  if (!player || !btnPlay) return;
  player.style.display = "";

  // ── iOS detection ──
  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // ── Extract readable text from .post-content ──
  function extractText() {
    var content = document.querySelector(".post-content");
    if (!content) return [];

    var clone = content.cloneNode(true);

    var selectors = [
      "pre", "code", ".mermaid", "svg", ".highlight",
      "script", "style", "table", ".module-nav", ".snippet-block"
    ];
    clone.querySelectorAll(selectors.join(",")).forEach(function (el) {
      el.remove();
    });

    var blocks = clone.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, blockquote, dd, dt");
    var chunks = [];
    blocks.forEach(function (block) {
      var text = block.textContent.replace(/\s+/g, " ").trim();
      if (text.length > 0) chunks.push(text);
    });

    return chunks;
  }

  // ── Map chunks back to real DOM elements for highlighting ──
  function getBlockElements() {
    var content = document.querySelector(".post-content");
    if (!content) return [];

    var all = content.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, blockquote, dd, dt");
    var blocks = [];
    all.forEach(function (el) {
      if (el.closest("pre, code, .mermaid, svg, .highlight, script, style, table, .module-nav")) return;
      var text = el.textContent.replace(/\s+/g, " ").trim();
      if (text.length > 0) blocks.push(el);
    });
    return blocks;
  }

  // ── Pick the best French voice available ──
  var chosenVoice = null;

  // Quality keywords ranked from best to worst
  var QUALITY_KEYWORDS = [
    "neural", "enhanced", "premium", "natural",  // best: neural/enhanced voices
    "google",                                     // Chrome's Google voices are good
    "microsoft",                                  // Edge/Windows neural voices
  ];

  function scoreVoice(v) {
    var name = v.name.toLowerCase();
    var score = 0;

    // Penalize compact/eSpeak voices heavily
    if (name.includes("compact") || name.includes("espeak")) return -100;

    // Bonus for quality keywords
    for (var i = 0; i < QUALITY_KEYWORDS.length; i++) {
      if (name.includes(QUALITY_KEYWORDS[i])) {
        score += (QUALITY_KEYWORDS.length - i) * 10;
      }
    }

    // Prefer non-local voices (usually higher quality on Chrome)
    if (!v.localService) score += 5;

    return score;
  }

  function pickVoice() {
    var voices = synth.getVoices();
    if (voices.length === 0) return;

    var frVoices = voices.filter(function (v) {
      return v.lang && v.lang.startsWith("fr");
    });

    if (frVoices.length > 0) {
      // Sort by quality score descending
      frVoices.sort(function (a, b) { return scoreVoice(b) - scoreVoice(a); });
      chosenVoice = frVoices[0];
    } else {
      // No French voice: pick best overall
      var sorted = voices.slice().sort(function (a, b) { return scoreVoice(b) - scoreVoice(a); });
      chosenVoice = sorted[0];
    }
  }

  pickVoice();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = pickVoice;
  }

  // ── State ──
  var chunks = [];
  var blockEls = [];
  var currentIndex = 0;
  var playing = false;
  var paused = false;
  var highlightedEl = null;
  var keepAliveTimer = null;
  var TTS_HIGHLIGHT_CLASS = "tts-highlight";

  function clearHighlight() {
    if (highlightedEl) {
      highlightedEl.classList.remove(TTS_HIGHLIGHT_CLASS);
      highlightedEl = null;
    }
  }

  function highlightBlock(index) {
    clearHighlight();
    if (index < blockEls.length) {
      highlightedEl = blockEls[index];
      highlightedEl.classList.add(TTS_HIGHLIGHT_CLASS);
      highlightedEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function showPlayBtn() {
    btnPlay.style.display = "";
    btnPause.style.display = "none";
  }

  function showPauseBtn() {
    btnPlay.style.display = "none";
    btnPause.style.display = "";
  }

  // ── iOS keep-alive workaround ──
  // iOS Safari silently stops speechSynthesis after ~15s.
  // Workaround: pause+resume every 10s to keep it alive.
  function startKeepAlive() {
    stopKeepAlive();
    if (!isIOS) return;
    keepAliveTimer = setInterval(function () {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 10000);
  }

  function stopKeepAlive() {
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
  }

  // ── Speak one chunk, then chain to the next ──
  function speakChunk(index) {
    if (index >= chunks.length) {
      stopAll();
      setStatus("Termine");
      return;
    }

    currentIndex = index;
    highlightBlock(index);
    setStatus("Lecture " + (index + 1) + "/" + chunks.length);

    var utt = new SpeechSynthesisUtterance(chunks[index]);
    utt.rate = parseFloat(speedSelect.value) || 1;
    utt.lang = "fr-FR";
    if (chosenVoice) utt.voice = chosenVoice;

    utt.onend = function () {
      if (playing && !paused) {
        speakChunk(index + 1);
      }
    };

    utt.onerror = function (e) {
      if (e.error !== "interrupted" && e.error !== "canceled") {
        console.warn("TTS error:", e.error);
        // On iOS, errors can happen silently — try next chunk
        if (playing && !paused) {
          speakChunk(index + 1);
        }
      }
    };

    synth.speak(utt);
  }

  // ── Controls ──
  function startPlaying() {
    if (paused && !isIOS) {
      // Resume (not reliable on iOS, so iOS always restarts chunk)
      synth.resume();
      paused = false;
      playing = true;
      showPauseBtn();
      startKeepAlive();
      setStatus("Lecture " + (currentIndex + 1) + "/" + chunks.length);
      return;
    }

    if (paused && isIOS) {
      // iOS: resume by re-speaking current chunk
      synth.cancel();
      paused = false;
      playing = true;
      showPauseBtn();
      startKeepAlive();
      speakChunk(currentIndex);
      return;
    }

    // Fresh start — on iOS, must call synth from direct user gesture
    synth.cancel();
    chunks = extractText();
    blockEls = getBlockElements();

    if (chunks.length === 0) {
      setStatus("Aucun texte");
      return;
    }

    playing = true;
    paused = false;
    currentIndex = 0;
    showPauseBtn();
    startKeepAlive();
    speakChunk(0);
  }

  function pausePlaying() {
    if (playing && !paused) {
      if (!isIOS) {
        synth.pause();
      } else {
        // iOS: pause() is unreliable, just cancel and remember position
        synth.cancel();
      }
      paused = true;
      stopKeepAlive();
      showPlayBtn();
      setStatus("Pause");
    }
  }

  function stopAll() {
    synth.cancel();
    playing = false;
    paused = false;
    currentIndex = 0;
    stopKeepAlive();
    clearHighlight();
    showPlayBtn();
    setStatus("Pret");
  }

  // ── Event listeners ──
  btnPlay.addEventListener("click", startPlaying);
  btnPause.addEventListener("click", pausePlaying);
  btnStop.addEventListener("click", stopAll);

  speedSelect.addEventListener("change", function () {
    if (playing && !paused) {
      synth.cancel();
      speakChunk(currentIndex);
    }
  });

  window.addEventListener("beforeunload", function () {
    stopKeepAlive();
    synth.cancel();
  });
})();
