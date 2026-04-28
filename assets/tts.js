(function () {
  "use strict";

  // ── Guard: no speechSynthesis → hide player, bail out ──
  if (!window.speechSynthesis) return;

  var synth = window.speechSynthesis;
  var player = document.getElementById("tts-player");
  var btnPlay = document.getElementById("tts-play");
  var btnPause = document.getElementById("tts-pause");
  var btnStop = document.getElementById("tts-stop");
  var status = document.getElementById("tts-status");
  var speedSelect = document.getElementById("tts-speed");

  if (!player || !btnPlay) return;
  player.style.display = "";

  // ── Extract readable text from .post-content ──
  function extractText() {
    var content = document.querySelector(".post-content");
    if (!content) return [];

    // Clone to avoid mutating the DOM
    var clone = content.cloneNode(true);

    // Remove elements that should not be read aloud
    var selectors = [
      "pre",                   // code blocks
      "code",                  // inline code
      ".mermaid",              // diagrams
      "svg",                   // SVG graphics
      ".highlight",            // syntax-highlighted blocks
      "script",
      "style",
      "table",                 // tables are hard to read aloud
      ".module-nav",           // navigation buttons
      ".snippet-block",        // snippet HTML comments rendered
    ];
    clone.querySelectorAll(selectors.join(",")).forEach(function (el) {
      el.remove();
    });

    // Get text from remaining block-level elements as separate chunks
    var blocks = clone.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, blockquote, dd, dt");
    var chunks = [];
    blocks.forEach(function (block) {
      var text = block.textContent.replace(/\s+/g, " ").trim();
      if (text.length > 0) {
        chunks.push(text);
      }
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
      // Skip elements inside removed containers
      if (el.closest("pre, code, .mermaid, svg, .highlight, script, style, table, .module-nav")) return;
      var text = el.textContent.replace(/\s+/g, " ").trim();
      if (text.length > 0) {
        blocks.push(el);
      }
    });
    return blocks;
  }

  // ── Pick a French voice (prefer higher-quality ones) ──
  var chosenVoice = null;

  function pickVoice() {
    var voices = synth.getVoices();
    // Prefer French voices, then any available
    var frVoices = voices.filter(function (v) {
      return v.lang && v.lang.startsWith("fr");
    });
    if (frVoices.length > 0) {
      // Prefer non-compact / high quality
      var preferred = frVoices.filter(function (v) {
        return !v.name.toLowerCase().includes("compact");
      });
      chosenVoice = preferred.length > 0 ? preferred[0] : frVoices[0];
    } else if (voices.length > 0) {
      chosenVoice = voices[0];
    }
  }

  // Voices may load asynchronously
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
    if (status) status.textContent = text;
  }

  function showPlayBtn() {
    btnPlay.style.display = "";
    btnPause.style.display = "none";
  }

  function showPauseBtn() {
    btnPlay.style.display = "none";
    btnPause.style.display = "";
  }

  // ── Speak one chunk, then chain to the next ──
  function speakChunk(index) {
    if (index >= chunks.length) {
      // Done
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
      // "interrupted" is normal when user stops/pauses
      if (e.error !== "interrupted" && e.error !== "canceled") {
        console.warn("TTS error:", e.error);
      }
    };

    synth.speak(utt);
  }

  // ── Controls ──
  function startPlaying() {
    if (paused) {
      // Resume
      synth.resume();
      paused = false;
      playing = true;
      showPauseBtn();
      setStatus("Lecture " + (currentIndex + 1) + "/" + chunks.length);
      return;
    }

    // Fresh start
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
    speakChunk(0);
  }

  function pausePlaying() {
    if (playing && !paused) {
      synth.pause();
      paused = true;
      showPlayBtn();
      setStatus("Pause");
    }
  }

  function stopAll() {
    synth.cancel();
    playing = false;
    paused = false;
    currentIndex = 0;
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
      // Restart current chunk at new speed
      synth.cancel();
      speakChunk(currentIndex);
    }
  });

  // Clean up on page unload
  window.addEventListener("beforeunload", function () {
    synth.cancel();
  });
})();
