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
  var progressBar = document.getElementById("tts-progress");
  var voiceInfo = document.getElementById("tts-voice-info");

  var btnToggle = document.getElementById("tts-toggle");
  var btnHide = document.getElementById("tts-hide");

  if (!player || !btnPlay) return;

  // ── Visibility toggle with localStorage persistence ──
  var STORAGE_KEY = "tts-visible";

  function readVisibleState() {
    var val = localStorage.getItem(STORAGE_KEY);
    // Default to hidden if never set
    return val === "true";
  }

  function applyVisibleState(visible) {
    // Always apply BOTH sides explicitly
    if (visible) {
      player.classList.remove("tts-hidden");
      if (btnToggle) btnToggle.classList.add("tts-toggle-active");
    } else {
      player.classList.add("tts-hidden");
      if (btnToggle) btnToggle.classList.remove("tts-toggle-active");
    }
  }

  function togglePlayer() {
    var next = !readVisibleState();
    localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
    applyVisibleState(next);
    // Stop playback when hiding
    if (!next && playing) stopAll();
  }

  function hidePlayer() {
    localStorage.setItem(STORAGE_KEY, "false");
    applyVisibleState(false);
    if (playing) stopAll();
  }

  // Restore saved state on page load — force both classes to match stored state
  applyVisibleState(readVisibleState());

  // Show the toggle button (CSS has display:none, JS must set flex explicitly)
  if (btnToggle) {
    btnToggle.style.display = "inline-flex";
    btnToggle.addEventListener("click", togglePlayer);
  }

  if (btnHide) {
    btnHide.addEventListener("click", hidePlayer);
  }

  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // ═══════════════════════════════════════════════════════════════
  //  1. TEXT NORMALISATION PIPELINE
  // ═══════════════════════════════════════════════════════════════

  // ── 1a. Acronym dictionary ──
  // "spell" = epeler lettre par lettre, "say" = prononcer comme un mot
  var ACRONYMS = {
    // ── Cloud / AWS services ──
    "AWS":    { mode: "spell" },
    "EC2":    { mode: "say", as: "E C 2" },
    "S3":     { mode: "say", as: "S 3" },
    "IAM":    { mode: "spell" },
    "VPC":    { mode: "spell" },
    "EBS":    { mode: "spell" },
    "EFS":    { mode: "spell" },
    "RDS":    { mode: "spell" },
    "ECS":    { mode: "spell" },
    "EKS":    { mode: "spell" },
    "ELB":    { mode: "spell" },
    "ALB":    { mode: "spell" },
    "NLB":    { mode: "spell" },
    "SNS":    { mode: "spell" },
    "SQS":    { mode: "spell" },
    "AMI":    { mode: "spell" },
    "ARN":    { mode: "spell" },
    "CDN":    { mode: "spell" },
    "KMS":    { mode: "spell" },
    "WAF":    { mode: "say", as: "waf" },
    "EMR":    { mode: "spell" },
    "SES":    { mode: "spell" },
    // ── *aaS patterns ──
    "SaaS":   { mode: "say", as: "sasse" },
    "IaaS":   { mode: "say", as: "yasse" },
    "PaaS":   { mode: "say", as: "passe" },
    "FaaS":   { mode: "say", as: "fasse" },
    "DaaS":   { mode: "say", as: "dasse" },
    "BaaS":   { mode: "say", as: "basse" },
    "CaaS":   { mode: "say", as: "casse" },
    "XaaS":   { mode: "say", as: "X asse" },
    // ── DevOps / infra ──
    "CI":     { mode: "spell" },
    "CD":     { mode: "spell" },
    "VM":     { mode: "spell" },
    "OS":     { mode: "spell" },
    "SSH":    { mode: "spell" },
    "SSL":    { mode: "spell" },
    "TLS":    { mode: "spell" },
    "DNS":    { mode: "spell" },
    "TCP":    { mode: "spell" },
    "UDP":    { mode: "spell" },
    "IP":     { mode: "spell" },
    "HTTP":   { mode: "spell" },
    "HTTPS":  { mode: "say", as: "H T T P S" },
    "API":    { mode: "spell" },
    "CLI":    { mode: "spell" },
    "SDK":    { mode: "spell" },
    "MFA":    { mode: "spell" },
    "SSO":    { mode: "spell" },
    "ACL":    { mode: "spell" },
    "SMTP":   { mode: "spell" },
    "IOPS":   { mode: "say", as: "aille opse" },
    "CIDR":   { mode: "say", as: "ci-deure" },
    "RBAC":   { mode: "say", as: "eur-bac" },
    "FIFO":   { mode: "say", as: "fi-fo" },
    "LIFO":   { mode: "say", as: "li-fo" },
    // ── Data / formats ──
    "REST":   { mode: "say", as: "resste" },
    "CRUD":   { mode: "say", as: "crude" },
    "JSON":   { mode: "say", as: "jéyzone" },
    "YAML":   { mode: "say", as: "ya-meul" },
    "SQL":    { mode: "spell" },
    "NoSQL":  { mode: "say", as: "no S Q L" },
    "HTML":   { mode: "spell" },
    "CSS":    { mode: "spell" },
    "CSV":    { mode: "spell" },
    "XML":    { mode: "spell" },
    "URL":    { mode: "spell" },
    "URI":    { mode: "spell" },
    "PDF":    { mode: "spell" },
    // ── Hardware / misc ──
    "CPU":    { mode: "spell" },
    "GPU":    { mode: "spell" },
    "RAM":    { mode: "say", as: "rame" },
    "SSD":    { mode: "spell" },
    "HDD":    { mode: "spell" },
    "SLA":    { mode: "spell" },
    "DOM":    { mode: "say", as: "domme" },
    "IDE":    { mode: "spell" },
    "AZ":     { mode: "spell" },
    // ── Networking ──
    "NAT":    { mode: "say", as: "natte" },
    "VPN":    { mode: "spell" },
    "BGP":    { mode: "spell" },
    "VLAN":   { mode: "say", as: "vi-lane" },
    "LAN":    { mode: "say", as: "lane" },
    "WAN":    { mode: "say", as: "wane" },
  };

  // Build regex for known acronyms (longest first, case-sensitive)
  var acronymKeys = Object.keys(ACRONYMS).sort(function (a, b) {
    return b.length - a.length;
  });
  var acronymRe = new RegExp(
    "\\b(" + acronymKeys.map(function (k) {
      return k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("|") + ")\\b", "g"
  );

  function spellWord(w) {
    return w.split("").join(" ");
  }

  // ── 1b. AWS service names (English pronunciation hints) ──
  var SERVICE_NAMES = {
    "CloudFront":       "Cloud-Fronte",
    "CloudWatch":       "Cloud-Wotch",
    "CloudFormation":   "Cloud-Formation",
    "CloudTrail":       "Cloud-Traile",
    "Elastic Beanstalk":"Elastic Bine-stok",
    "Beanstalk":        "Bine-stok",
    "Lambda":           "Lamm-da",
    "DynamoDB":         "Dynamo D B",
    "ElastiCache":      "Élasti-cache",
    "Fargate":          "Far-guéte",
    "CodePipeline":     "Code-Païpe-laïne",
    "CodeBuild":        "Code-Bilde",
    "CodeDeploy":       "Code-Diploy",
    "CodeCommit":       "Code-Comite",
    "Redshift":         "Rède-chifte",
    "Lightsail":        "Laïte-séle",
    "Snowball":         "Snô-bôl",
    "Glacier":          "Gla-ci-ère",
    "Athena":           "Atéhna",
    "Kinesis":          "Ki-né-cisse",
    "Cognito":          "Co-gni-to",
    "GuardDuty":        "Garde-Diou-ti",
    "Macie":            "Mé-ci",
    "Inspector":        "Ins-pèk-teur",
    "Shield":           "Childe",
    "Route 53":         "Route 53",
    "Terraform":        "Terra-forme",
    "Kubernetes":       "Kou-ber-né-tice",
    "Docker":           "Do-keur",
    "Ansible":          "Anne-si-beul",
    "Jenkins":          "Djène-kinsse",
    "Nginx":            "Ène-jinnx",
    "Apache":           "A-patche",
  };

  var serviceKeys = Object.keys(SERVICE_NAMES).sort(function (a, b) {
    return b.length - a.length;
  });
  var serviceRe = new RegExp(
    "(" + serviceKeys.map(function (k) {
      return k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("|") + ")", "gi"
  );

  // ── 1c. Units normalisation ──
  function normalizeUnits(text) {
    text = text.replace(/(\d+)\s*ms\b/gi, "$1 millisecondes");
    text = text.replace(/(\d+)\s*GB\b/gi, "$1 gigaoctets");
    text = text.replace(/(\d+)\s*MB\b/gi, "$1 mégaoctets");
    text = text.replace(/(\d+)\s*KB\b/gi, "$1 kilooctets");
    text = text.replace(/(\d+)\s*TB\b/gi, "$1 téraoctets");
    text = text.replace(/(\d+)\s*Go\b/g, "$1 gigaoctets");
    text = text.replace(/(\d+)\s*Mo\b/g, "$1 mégaoctets");
    text = text.replace(/(\d+)\s*Ko\b/g, "$1 kilooctets");
    text = text.replace(/(\d+)\s*GHz\b/gi, "$1 gigahertz");
    text = text.replace(/(\d+)\s*MHz\b/gi, "$1 mégahertz");
    text = text.replace(/(\d+)\s*Gbps\b/gi, "$1 gigabits par seconde");
    text = text.replace(/(\d+)\s*Mbps\b/gi, "$1 mégabits par seconde");
    text = text.replace(/(\d+)\s*%/g, "$1 pourcent");
    text = text.replace(/(\d+)\s*€/g, "$1 euros");
    text = text.replace(/\$\s*(\d+)/g, "$1 dollars");
    return text;
  }

  // ── 1d. CLI commands & code-like strings ──
  function normalizeCLI(text) {
    // Skip lines that look like full CLI commands
    if (/^\s*(aws|docker|kubectl|terraform|git|npm|pip|curl|ssh)\s+/i.test(text)) {
      return "... commande technique ...";
    }
    // Inline: replace common CLI patterns
    text = text.replace(/`([^`]+)`/g, function (_, code) {
      if (code.length > 30) return " ... extrait de code ... ";
      // Short inline code: try to read it
      return " " + code.replace(/[_\-\/\.]/g, " ") + " ";
    });
    return text;
  }

  // ── 1e. URLs ──
  function normalizeURLs(text) {
    text = text.replace(/https?:\/\/[^\s)]+/g, " ... lien ... ");
    return text;
  }

  // ── 1f. Symbols & punctuation for prosody ──
  function normalizeSymbols(text) {
    text = text.replace(/→/g, ", c'est-a-dire, ");
    text = text.replace(/←/g, ", vient de, ");
    text = text.replace(/⇒/g, ", donc, ");
    text = text.replace(/✅/g, "");
    text = text.replace(/❌/g, "");
    text = text.replace(/⚠️?/g, ", attention, ");
    text = text.replace(/💡/g, "");
    text = text.replace(/🔒/g, "");
    text = text.replace(/[📌📎🔗🎯🧠📝📦🛠️⚙️☁️🐳🚀💻🔧📋]/gu, "");
    text = text.replace(/\*\*/g, "");      // markdown bold
    text = text.replace(/\*([^*]+)\*/g, "$1"); // markdown italic
    text = text.replace(/#{1,6}\s*/g, "");  // markdown headings
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // markdown links → text only
    return text;
  }

  // ── 1g. Prosody: enrich punctuation for natural pauses ──
  function enrichProsody(text) {
    // Add micro-pauses after colons (common in explanations)
    text = text.replace(/:\s*/g, ": ... ");
    // Longer pause after section titles (short sentences ending without period)
    if (text.length < 60 && !/[.!?]$/.test(text.trim())) {
      text = text + " ...";
    }
    // Break very long sentences at semicolons
    text = text.replace(/;\s*/g, ". ");
    return text;
  }

  // ── MASTER NORMALISATION FUNCTION ──
  function normalizeText(text) {
    text = normalizeURLs(text);
    text = normalizeSymbols(text);
    text = normalizeCLI(text);
    text = normalizeUnits(text);

    // Known acronyms
    text = text.replace(acronymRe, function (match) {
      var entry = ACRONYMS[match];
      if (!entry) return match;
      if (entry.mode === "spell") return spellWord(match);
      return entry.as;
    });

    // Service names pronunciation
    text = text.replace(serviceRe, function (match) {
      // Case-insensitive lookup
      for (var key in SERVICE_NAMES) {
        if (key.toLowerCase() === match.toLowerCase()) return SERVICE_NAMES[key];
      }
      return match;
    });

    // Unknown ALL-CAPS 2-6 letters → spell
    text = text.replace(/\b([A-Z]{2,6})\b/g, function (match) {
      return spellWord(match);
    });

    // Dash-separated technical terms → spaces
    text = text.replace(/([a-z])-([a-z])/gi, "$1 $2");

    text = enrichProsody(text);

    // Clean up multiple spaces / dots
    text = text.replace(/\s{2,}/g, " ");
    text = text.replace(/\.{4,}/g, "...");

    return text.trim();
  }

  // ═══════════════════════════════════════════════════════════════
  //  2. TEXT EXTRACTION & SEGMENTATION
  // ═══════════════════════════════════════════════════════════════

  var SKIP_SELECTORS = [
    "pre", "code", ".mermaid", "svg", ".highlight",
    "script", "style", "table", ".module-nav", ".snippet-block"
  ].join(",");

  var BLOCK_SELECTORS = "h1, h2, h3, h4, h5, h6, p, li, blockquote, dd, dt";

  // Segment type determines prosody
  var SEG_HEADING = "heading";
  var SEG_TEXT = "text";
  var SEG_LIST = "list";

  function extractSegments() {
    var content = document.querySelector(".post-content");
    if (!content) return [];

    var clone = content.cloneNode(true);
    clone.querySelectorAll(SKIP_SELECTORS).forEach(function (el) { el.remove(); });

    var blocks = clone.querySelectorAll(BLOCK_SELECTORS);
    var segments = [];

    blocks.forEach(function (block) {
      var raw = block.textContent.replace(/\s+/g, " ").trim();
      if (raw.length === 0) return;

      var tag = block.tagName.toLowerCase();
      var type = SEG_TEXT;
      if (/^h[1-6]$/.test(tag)) type = SEG_HEADING;
      else if (tag === "li") type = SEG_LIST;

      // Split long paragraphs into sentences for smoother flow
      if (type === SEG_TEXT && raw.length > 200) {
        var sentences = splitSentences(raw);
        sentences.forEach(function (s, i) {
          segments.push({ text: s, type: type, first: i === 0 });
        });
      } else {
        segments.push({ text: raw, type: type, first: true });
      }
    });

    return segments;
  }

  // Smart sentence splitting: split on . ! ? but not on abbreviations or numbers
  function splitSentences(text) {
    var parts = text.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ü])/);
    var result = [];
    var buffer = "";

    for (var i = 0; i < parts.length; i++) {
      buffer += (buffer ? " " : "") + parts[i];
      // Only emit if buffer is substantial enough
      if (buffer.length >= 40 || i === parts.length - 1) {
        result.push(buffer);
        buffer = "";
      }
    }
    if (buffer) result.push(buffer);
    return result;
  }

  // Map segments back to DOM elements for highlighting
  function getBlockElements() {
    var content = document.querySelector(".post-content");
    if (!content) return [];

    var all = content.querySelectorAll(BLOCK_SELECTORS);
    var blocks = [];
    all.forEach(function (el) {
      if (el.closest(SKIP_SELECTORS)) return;
      var text = el.textContent.replace(/\s+/g, " ").trim();
      if (text.length > 0) blocks.push(el);
    });
    return blocks;
  }

  // ═══════════════════════════════════════════════════════════════
  //  3. VOICE SELECTION
  // ═══════════════════════════════════════════════════════════════

  var voiceFR = null;

  var VOICE_QUALITY = [
    "neural", "enhanced", "premium", "natural",
    "google", "microsoft", "samantha",
  ];

  function scoreVoice(v) {
    var name = v.name.toLowerCase();
    if (name.includes("compact") || name.includes("espeak")) return -100;

    var score = 0;
    for (var i = 0; i < VOICE_QUALITY.length; i++) {
      if (name.includes(VOICE_QUALITY[i])) score += (VOICE_QUALITY.length - i) * 10;
    }
    if (!v.localService) score += 5;
    return score;
  }

  function pickVoice() {
    var voices = synth.getVoices();
    if (voices.length === 0) return;

    var fr = voices.filter(function (v) { return v.lang && v.lang.startsWith("fr"); });
    if (fr.length > 0) {
      fr.sort(function (a, b) { return scoreVoice(b) - scoreVoice(a); });
      voiceFR = fr[0];
    } else {
      var all = voices.slice().sort(function (a, b) { return scoreVoice(b) - scoreVoice(a); });
      voiceFR = all[0];
    }

    if (voiceInfo && voiceFR) {
      voiceInfo.textContent = voiceFR.name.replace(/^Microsoft\s+/i, "").replace(/\s+Online.*$/i, "");
    }
  }

  pickVoice();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = pickVoice;
  }

  // ═══════════════════════════════════════════════════════════════
  //  4. PROSODY ENGINE
  // ═══════════════════════════════════════════════════════════════

  var BASE_RATE = 1;
  var BASE_PITCH = 1;

  // Rate/pitch adjustments per segment type
  function prosodyFor(segment) {
    var userSpeed = parseFloat(speedSelect.value) || 1;
    var rate = userSpeed;
    var pitch = BASE_PITCH;

    switch (segment.type) {
      case SEG_HEADING:
        rate = userSpeed * 0.88;   // slower for titles → emphasis
        pitch = 1.08;              // slightly higher → announces a section
        break;
      case SEG_LIST:
        rate = userSpeed * 0.95;   // slightly slower for bullet points
        pitch = 0.98;
        break;
      default:
        rate = userSpeed;
        pitch = 1.0;
    }

    // Clamp rate to API limits
    rate = Math.max(0.5, Math.min(rate, 3));
    pitch = Math.max(0.5, Math.min(pitch, 1.5));
    return { rate: rate, pitch: pitch };
  }

  // ═══════════════════════════════════════════════════════════════
  //  5. PLAYBACK ENGINE
  // ═══════════════════════════════════════════════════════════════

  var segments = [];
  var blockEls = [];
  var segToBlock = [];    // maps segment index → block element index
  var currentSeg = 0;
  var playing = false;
  var paused = false;
  var highlightedEl = null;
  var keepAliveTimer = null;
  var TTS_HIGHLIGHT = "tts-highlight";

  function clearHighlight() {
    if (highlightedEl) {
      highlightedEl.classList.remove(TTS_HIGHLIGHT);
      highlightedEl = null;
    }
  }

  function highlightBlock(segIndex) {
    clearHighlight();
    var blockIdx = segToBlock[segIndex];
    if (blockIdx !== undefined && blockIdx < blockEls.length) {
      highlightedEl = blockEls[blockIdx];
      highlightedEl.classList.add(TTS_HIGHLIGHT);
      highlightedEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function updateProgress() {
    if (!progressBar) return;
    var pct = segments.length > 0 ? Math.round((currentSeg / segments.length) * 100) : 0;
    progressBar.style.width = pct + "%";
  }

  function showPlayBtn() { btnPlay.style.display = ""; btnPause.style.display = "none"; }
  function showPauseBtn() { btnPlay.style.display = "none"; btnPause.style.display = ""; }

  // iOS keep-alive
  function startKeepAlive() {
    stopKeepAlive();
    if (!isIOS) return;
    keepAliveTimer = setInterval(function () {
      if (synth.speaking && !synth.paused) { synth.pause(); synth.resume(); }
    }, 10000);
  }
  function stopKeepAlive() {
    if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null; }
  }

  // ── Insert a silent pause between segments using a silent utterance ──
  function insertPause(ms, callback) {
    // Use an utterance of silence (a single space + very low volume doesn't work,
    // so we use the rate trick: speak "." very fast)
    if (ms <= 0) { callback(); return; }
    var pause = new SpeechSynthesisUtterance(".");
    pause.rate = 10;   // max speed → near-instant
    pause.volume = 0;  // silent
    pause.lang = "fr-FR";
    if (voiceFR) pause.voice = voiceFR;
    pause.onend = function () {
      setTimeout(callback, Math.max(0, ms - 50));
    };
    pause.onerror = function () { callback(); };
    synth.speak(pause);
  }

  // Pause duration based on segment type transition
  function pauseBetween(prevSeg, nextSeg) {
    if (!prevSeg) return 0;
    if (nextSeg.type === SEG_HEADING) return 600;  // big pause before headings
    if (prevSeg.type === SEG_HEADING) return 400;   // pause after heading
    if (nextSeg.first) return 200;                  // new paragraph
    return 80;                                       // between sentences
  }

  // ── Core: speak one segment, then chain ──
  function speakSegment(index) {
    if (index >= segments.length) {
      stopAll();
      setStatus("Termine");
      updateProgress();
      return;
    }

    currentSeg = index;
    highlightBlock(index);
    updateProgress();

    var total = segments.length;
    var blockNum = (segToBlock[index] || 0) + 1;
    setStatus("Lecture " + blockNum + "/" + blockEls.length);

    var seg = segments[index];
    var normalized = normalizeText(seg.text);

    // Skip empty segments after normalisation
    if (!normalized || normalized.length < 2) {
      if (playing && !paused) speakSegment(index + 1);
      return;
    }

    var pros = prosodyFor(seg);
    var utt = new SpeechSynthesisUtterance(normalized);
    utt.rate = pros.rate;
    utt.pitch = pros.pitch;
    utt.lang = "fr-FR";
    if (voiceFR) utt.voice = voiceFR;

    utt.onend = function () {
      if (!playing || paused) return;
      var nextIdx = index + 1;
      if (nextIdx >= segments.length) {
        stopAll();
        setStatus("Termine");
        updateProgress();
        return;
      }
      var delay = pauseBetween(seg, segments[nextIdx]);
      if (delay > 0) {
        insertPause(delay, function () {
          if (playing && !paused) speakSegment(nextIdx);
        });
      } else {
        speakSegment(nextIdx);
      }
    };

    utt.onerror = function (e) {
      if (e.error !== "interrupted" && e.error !== "canceled") {
        console.warn("TTS error:", e.error);
      }
      if (playing && !paused) speakSegment(index + 1);
    };

    synth.speak(utt);
  }

  // ── Build segment-to-block mapping ──
  function buildSegToBlock(segs, blocks) {
    var map = [];
    var blockIdx = 0;
    for (var i = 0; i < segs.length; i++) {
      map.push(blockIdx);
      // If this is the last sub-sentence of a block, advance to next block
      if (i + 1 < segs.length && segs[i + 1].first) {
        blockIdx++;
      }
    }
    return map;
  }

  // ═══════════════════════════════════════════════════════════════
  //  6. CONTROLS
  // ═══════════════════════════════════════════════════════════════

  function startPlaying() {
    if (paused && !isIOS) {
      synth.resume();
      paused = false; playing = true;
      showPauseBtn(); startKeepAlive();
      setStatus("Lecture...");
      return;
    }
    if (paused && isIOS) {
      synth.cancel();
      paused = false; playing = true;
      showPauseBtn(); startKeepAlive();
      speakSegment(currentSeg);
      return;
    }

    synth.cancel();
    segments = extractSegments();
    blockEls = getBlockElements();
    segToBlock = buildSegToBlock(segments, blockEls);

    if (segments.length === 0) { setStatus("Aucun texte"); return; }

    playing = true; paused = false; currentSeg = 0;
    showPauseBtn(); startKeepAlive();
    speakSegment(0);
  }

  function pausePlaying() {
    if (!playing || paused) return;
    if (!isIOS) { synth.pause(); } else { synth.cancel(); }
    paused = true;
    stopKeepAlive(); showPlayBtn();
    setStatus("Pause");
  }

  function stopAll() {
    synth.cancel();
    playing = false; paused = false; currentSeg = 0;
    stopKeepAlive(); clearHighlight(); showPlayBtn();
    setStatus("Pret");
    if (progressBar) progressBar.style.width = "0%";
  }

  // ═══════════════════════════════════════════════════════════════
  //  7. EVENT BINDING
  // ═══════════════════════════════════════════════════════════════

  btnPlay.addEventListener("click", startPlaying);
  btnPause.addEventListener("click", pausePlaying);
  btnStop.addEventListener("click", stopAll);

  speedSelect.addEventListener("change", function () {
    if (playing && !paused) {
      synth.cancel();
      speakSegment(currentSeg);
    }
  });

  window.addEventListener("beforeunload", function () {
    stopKeepAlive(); synth.cancel();
  });
})();
