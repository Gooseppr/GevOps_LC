Skill: Humanizer (text instructions) :
───


Goal


Make AI-sounding text read like a specific human wrote it. Detect and remove common LLM tells across wording, structure, tone, and statistical signals, while preserving meaning and intended tone.


───


Humanization checklist


1. Read the draft and identify patterns from the 28-item list.

2. Compute stats: burstiness, type-token ratio, sentence-length variance, trigram repetition.

3. Flag suspicious vocabulary (Tier 1 “dead giveaways”, Tier 2 dense jargon, cliché phrases).

4. Rewrite problematic sections with concrete, personality-driven language.

5. Maintain meaning, facts, and intended tone (formal/casual/technical).

6. End with something specific; avoid generic “the future looks bright” endings.

7. Read aloud mentally—if it still feels like a press release or chatbot, keep editing.


───


Quick reference: 28 patterns to kill


• Content inflation: “marking a pivotal moment…”, name-dropping outlets with no facts, “...showcasing...highlighting...”—sounds like marketing copy.

• Promo adjectives: nestled, breathtaking, stunning, renowned.

• Vague attributions: “Experts believe…”, “Studies show…”.

• Formulaic resilience: “Despite challenges… continues to thrive”.

• AI vocabulary: delve, tapestry, seamless, leverage, leverage, synergy, multifaceted, empower, etc.

• Copula avoidance: “serves as”, “boasts”, “features” in place of “is/has”.

• Negative parallelism: “It’s not just X, it’s Y”.

• Rule of three: “innovation, inspiration, and insights”.

• Synonym cycling: protagonist → main character → central figure.

• False ranges: “from the Big Bang to dark matter”.

• Style ticks: em dash overuse, every word Title Cased, bold everywhere, inline headers (“- Topic: ...”), emoji bucket 🧠🚀✅.

• Chatbot artifacts: “Great question!”, “I hope this helps!”, “Let me break it down…”.

• Cutoff disclaimers: “As of my last training…”.

• Sycophancy / filler: “In order to”, “Due to the fact that”, “At this point in time”.

• Reasoning-chain scaffolding: “Step 1: … Step 2: …”.

• Over-structuring: too many headings/bullets for simple ideas.

• Confidence calibration tells: “I’m confident that…”, “It’s worth noting…”.

• Acknowledgment loops: “You’re asking about X...”.


(Use the SKILL page if you need the entire table.)


───


Statistical tells & targets


| Metric              | Human target  | AI typical |

| ------------------- | ------------- | ---------- |

| Burstiness          | 0.5–1.0       | 0.1–0.3    |

| Type-token ratio    | 0.5–0.7       | 0.3–0.5    |

| Sentence length CoV | High variance | Low        |

| Trigram repetition  | <0.05         | >0.10      |


───


Vocabulary bans / suspicion tiers


• Tier 1 (ban outright): delve, tapestry, vibrant, crucial, comprehensive, meticulous, embark, robust, seamless, groundbreaking, leverage, synergy, transformative, paramount, multifaceted, myriad, cornerstone, reimagine, empower, catalyst, invaluable, bustling, nestled, realm, unpack, actionable, impactful, learnings, bandwidth, net-net, value-add, thought leader.

• Tier 2 (use sparingly): furthermore, moreover, paradigm, holistic, utilize, facilitate, nuanced, illuminate, encompasses, catalyze, proactive, ubiquitous, quintessential, cadence, best practices.

• Cliché phrases: “In today’s digital age…”, “It is worth noting…”, “plays a crucial role…”, “serves as a testament…”, “in the realm of…”, “embark on a journey…”, “pain points”, “move the needle”, “low-hanging fruit”, etc.


───


Core rewrite principles


• Write plainly: “is/has” > “serves as/boasts”. Cut filler (“in order to” → “to”).

• Be specific: cite a data point, name a source, describe what actually happened.

Add viewpoint: react to facts, acknowledge complexity/messiness.

• Vary rhythm: short fragments next to longer meandering sentences.

• Drop chatbot tone: no “Great question!”, no “Let me know if you need anything else.”

• End concretely: “Storage costs $X/kWh and that’s the bottleneck”, not “The future looks bright.”


───


Process script (Claude-facing)


1. Scan text for pattern matches (use the 28-pattern checklist and vocabulary tiers).

2. Compute stats (burstiness, TTR, sentence-length CoV, trigram repetition).

3. List issues grouped by priority (content inflation, vocabulary, structure).

4. Rewrite affected segments with human cadence and specifics.

5. Verify by reading the new version aloud in your head.


───


CLI / tooling (optional if you run the code yourself)


# Score 0–100 (higher = more AI-like)

echo "text" | node src/cli.js score


# Detailed analysis

node src/cli.js analyze -f draft.md


# Markdown report

node src/cli.js report article.txt > report.md


# Suggestions grouped by priority

node src/cli.js suggest essay.txt


# Stats only

node src/cli.js stats essay.txt


# Auto-fix pass (produces rewritten text)

node src/cli.js humanize --autofix -f article.txt


# JSON output for programmatic use

node src/cli.js analyze --json < input.txt


An API server and MCP server also ship in the repo, but run them only after auditing (CORS is wide open by default).


───


“Always-On Mode” (use with caution)


The repo provides copy-paste blocks for OpenClaw SOUL.md, Claude custom instructions, etc., that permanently ban Tier‑1 vocabulary, filler, sycophancy, etc. These are powerful but effectively rewrite your global system prompt. Only adopt them if you explicitly want the assistant to always enforce these rules. For most workflows, prefer on-demand humanization.

