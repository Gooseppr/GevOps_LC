name: create-skill

description: >

  Meta-skill factory that designs, writes, tests, refines, and self-improves

  skills for Claude Code. Use this skill whenever someone needs a new skill

  built from scratch, an existing skill improved or extended, a skill audited

  for quality, or a skill library maintained. Triggers include: "create a

  skill", "make a skill for", "build a skill that", "write a skill", "I need

  a skill", "add a skill for", "skill for X", "improve this skill", "update

  this skill", "the skill isn't working", "make the skill better", "skill

  keeps failing", "skill doesn't trigger", "audit my skills", "what skills do

  I have", "list my skills", "organize my skills", "skill for [any domain]",

  or any time the user describes a workflow or behavior they want Claude to

  repeat reliably. Also triggers when the user says "remember how to do X"

  or "always do X this way" — that's a skill waiting to be written. This

  skill should trigger proactively: if the user does something complex and

  repeatable, offer to capture it as a skill without being asked.

---


# 🏭 Create-Skill — The Self-Improving Skill Factory


You are a **skill architect**. Your job is to capture human expertise,

repeatable workflows, and domain knowledge into SKILL.md files that make

every future interaction faster, sharper, and more consistent.


A great skill is:

- **Triggerable** — the description makes Claude invoke it at the right moment

- **Complete** — contains everything needed to execute without re-asking

- **Generalizable** — works across many inputs, not just the example at hand

- **Self-improving** — gets better with every session it's used


This skill runs a full loop: Discover → Design → Write → Test → Refine → Deploy → Monitor.


---


## 🔍 Phase 0 — Skill Discovery


Before writing anything, understand what the user actually needs.


### Discovery Mode: New skill from scratch


Ask these questions (one at a time, naturally — not as a form):

```

1. WHAT:    What should this skill enable Claude to do?

            (Be specific: "generate weekly reports" not "help with reports")


2. WHEN:    What does the user say/type that should trigger it?

            List 5 example phrasings, from obvious to subtle.


3. INPUT:   What does the user typically provide?

            (Files, URLs, raw text, nothing, partial code?)


4. OUTPUT:  What does the ideal output look like?

            (File? Prose? Code? A series of actions? Ask for an example.)


5. QUALITY: How do you know the output is good vs. bad?

            (What would make the user say "perfect" vs. "not quite"?)


6. EDGE CASES: What variations exist? What should it NOT do?

```


### Discovery Mode: Improvement request


When the user says a skill is wrong/broken/insufficient:

```

1. What did the skill produce? (get the bad output)

2. What should it have produced? (get the ideal output)

3. Is this a one-time miss or a systematic pattern?

4. Are there other cases where the same thing goes wrong?

```


### Discovery Mode: Capture from conversation


When the user does something complex in the current session, offer to capture it:

```

"That was a solid workflow — want me to turn that into a skill so

Claude remembers how to do it this way every time?"

```


Extract from the conversation:

- Tools used and in what order

- Corrections the user made mid-session

- Final output format and structure

- Any "always do this" or "never do that" signals


---


## 🗂️ Phase 1 — Skill Taxonomy & Library


### Skill categories and where they live

```

~/.claude/skills/

├── productivity/         # writing, summarizing, formatting

├── engineering/          # code, devops, architecture

├── design/               # UI/UX, branding, assets

├── data/                 # analysis, ETL, visualization

├── automation/           # n8n, Make, Zapier, scripts

├── research/             # web search, synthesis, fact-checking

├── communication/        # emails, messages, proposals

├── domain/               # domain-specific (finance, legal, medical)

└── meta/                 # skills about skills (this one)

```


### Skill library audit command

```bash

# List all installed skills with their trigger descriptions

find ~/.claude/skills -name "SKILL.md" | while read f; do

  name=$(grep "^name:" "$f" | head -1 | sed 's/name: //')

  dir=$(dirname "$f")

  lines=$(wc -l < "$f")

  echo "[$name] $dir ($lines lines)"

done


# Check for duplicate/overlapping skills

find ~/.claude/skills -name "SKILL.md" -exec grep -h "^description:" {} \; | sort

```


### Skill health check

```python

def audit_skill_library(skills_dir: str) -> dict:

    """

    Audit all skills for quality signals.

    Returns a report with suggestions per skill.

    """

    import os, re

    from pathlib import Path


    issues = {}

    for skill_md in Path(skills_dir).rglob("SKILL.md"):

        content = skill_md.read_text()

        name    = skill_md.parent.name

        checks  = []


        # Check frontmatter

        if "name:" not in content:

            checks.append("❌ Missing name in frontmatter")

        if "description:" not in content:

            checks.append("❌ Missing description in frontmatter")


        # Check description quality

        desc_match = re.search(r'description:(.+?)(?=\n\w|\Z)', content, re.DOTALL)

        if desc_match:

            desc = desc_match.group(1).strip()

            if len(desc) < 50:

                checks.append("⚠️  Description too short — may not trigger reliably")

            if "triggers include" not in desc.lower() and "use this" not in desc.lower():

                checks.append("⚠️  Description lacks trigger examples")

            if desc.count(",") < 3:

                checks.append("⚠️  Description has few trigger phrases — add more synonyms")


        # Check skill body

        word_count = len(content.split())

        if word_count < 100:

            checks.append("⚠️  Very short skill — may be too vague to be useful")

        if word_count > 5000:

            checks.append("⚠️  Very long skill — consider splitting into sections")

        if "example" not in content.lower() and "e.g." not in content.lower():

            checks.append("💡 No examples found — adding examples improves quality")

        if "don't" not in content.lower() and "avoid" not in content.lower() and "never" not in content.lower():

            checks.append("💡 No anti-patterns defined — consider adding 'avoid' section")


        issues[name] = {

            "path": str(skill_md),

            "word_count": word_count,

            "checks": checks,

            "health": "🔴 Needs work" if any("❌" in c for c in checks)

                      else "🟡 Could improve" if checks

                      else "✅ Looks good"

        }


    return issues

```


---


## ✍️ Phase 2 — Skill Writing Engine


### The SKILL.md Template


Every skill starts from this template. Fill it section by section.

```markdown

---

name: [kebab-case-name]

description: >

  [One sentence of what it does.]

  Use this skill when [specific trigger conditions].

  Triggers include: [10+ trigger phrases, comma-separated, covering:

    - explicit requests ("create a X")

    - implicit signals ("I need to X")

    - frustration signals ("this X isn't working")

    - domain keywords

    - file types involved

    - action verbs that imply this skill]

  Always use this skill even when [edge case where it's not obvious].

  Never wait to be explicitly asked — proactively apply when [context signal].

---


# [Skill Name] — [One-line value proposition]


[Who is Claude in this skill? What expert role does it play?]

[What is the core promise of this skill?]


---


## 🧠 Phase 0 — Understand Before Acting


[What must Claude understand before starting?]

[What questions to ask, what to infer, what to assume by default?]

[What context signals change how to proceed?]


---


## 📋 Phase N — [Main Workflow Phases]


[Organize the skill into phases. Each phase is a clear, bounded step.]

[Use code blocks for commands, templates, examples.]

[Include: what to do, how to do it, why it matters, what good looks like.]


---


## ✅ Output Format


[Exact specification of what to produce.]

[Template if applicable. Examples of good vs. bad output.]


---


## 🚫 Anti-Patterns


[What NOT to do. Why those mistakes happen. How to avoid them.]


---


## 📚 References


[Links, docs, tools relevant to this skill.]

```


---


## 🏗️ Phase 3 — Frontmatter Engineering


The description field is the skill's **soul**. It determines when Claude

invokes the skill. Poorly written descriptions = skill never triggers.


### Description anatomy

```yaml

description: >

  # SENTENCE 1: What the skill does (1 sentence, outcome-focused)

  Produces production-grade [output] for [context/audience].


  # SENTENCE 2: Primary trigger condition

  Use this skill when the user asks for [core use case] or mentions [domain].


  # SENTENCE 3+: Trigger phrase list (the more the better)

  Triggers include: "[phrase 1]", "[phrase 2]", "[phrase 3]", [file types],

  [frustration signals], [adjacent synonyms], [implicit behaviors].


  # SENTENCE N: Proactive trigger (what to look for without being asked)

  Also triggers when [implicit context signal that implies this skill].

```


### Description quality rubric


| Signal | Bad | Good |

|---|---|---|

| Length | < 50 words | 100–300 words |

| Trigger count | 0–3 | 10–20+ |

| Includes synonyms | ❌ | ✅ |

| Includes frustration signals | ❌ | ✅ |

| Includes file types | ❌ (if relevant) | ✅ |

| Proactive trigger | ❌ | ✅ |

| Outcome-focused | ❌ | ✅ |


### Trigger phrase generation — think in layers

```

Layer 1 — Explicit: what people literally type

  "create a skill", "make a skill for", "build a skill"


Layer 2 — Synonyms: different words, same intent

  "write a skill", "design a skill", "generate a skill"


Layer 3 — Implicit: they need it but don't say it

  "remember how to do this", "always do X this way"


Layer 4 — Adjacent: related tasks that could use this

  "automate this workflow", "capture this process"


Layer 5 — Frustration: something is broken

  "skill isn't working", "keeps failing", "not triggering"


Layer 6 — Domain keywords: nouns that imply the skill

  "workflow", "automation", "pipeline", "prompt engineering"


Layer 7 — File types: specific inputs

  ".skill file", "SKILL.md", "skills folder"

```


### Description anti-patterns

```

❌ "This skill helps with things."

❌ "Use when needed."

❌ "Skill for creating things."

❌ (description only 1 sentence)

❌ No trigger phrase list

❌ Trigger list has < 5 phrases

❌ No proactive trigger signal

❌ Triggers only cover the obvious case

```


---


## 🧪 Phase 4 — Skill Testing Protocol


A skill is not done until it's been tested. Always run at least 3 test cases.


### Test case design principles


Design tests that cover:

```

1. The obvious case      — exactly what the description says it does

2. The synonym case      — same intent, different phrasing

3. The implicit case     — skill needed but not explicitly asked for

4. The edge case         — unusual input, ambiguous request

5. The negative case     — something that should NOT trigger this skill

```


### Test case template

```json

{

  "skill_name": "your-skill-name",

  "evals": [

    {

      "id": 1,

      "name": "obvious-trigger",

      "prompt": "Create a skill for converting markdown to PDF",

      "expected": "Full SKILL.md with frontmatter, phases, examples",

      "should_trigger": true

    },

    {

      "id": 2,

      "name": "implicit-trigger",

      "prompt": "I always want code reviews to include security checks",

      "expected": "Offer to create a code-review skill with security checks built in",

      "should_trigger": true

    },

    {

      "id": 3,

      "name": "synonym-trigger",

      "prompt": "Write me an instruction set for handling customer emails",

      "expected": "Recognize this as a skill, produce SKILL.md format",

      "should_trigger": true

    },

    {

      "id": 4,

      "name": "non-trigger",

      "prompt": "How do I sort a list in Python?",

      "expected": "Answer the question directly, no skill creation needed",

      "should_trigger": false

    }

  ]

}

```


### Self-evaluation checklist (run after writing every skill)

```

TRIGGERING

[ ] Does the description cover all 7 trigger layers?

[ ] Are there 10+ trigger phrases?

[ ] Does it include a proactive trigger signal?

[ ] Would someone who doesn't say "skill" still trigger it?


COMPLETENESS

[ ] Can Claude complete the task without re-asking for info?

[ ] Are the output format and success criteria defined?

[ ] Are examples of good output included?

[ ] Are anti-patterns documented?


GENERALIZABILITY

[ ] Does it work for the example AND 5 variations of it?

[ ] Are instructions explained with "why" not just "what"?

[ ] Are there no hardcoded specifics that would break other inputs?


QUALITY

[ ] Is it under 500 lines? (split into files if not)

[ ] Does it avoid ALL CAPS MUST commands? (use reasoning instead)

[ ] Is there a clear progression through phases?

[ ] Does the skill name match the frontmatter name field?

```


---


## 🔄 Phase 5 — The Improvement Loop


Skills are never final. They improve through use.


### Improvement triggers

```

User says "that's not right" → diagnostic improvement

User says "almost, but..."   → refinement improvement

Skill not triggering         → description improvement

Output format wrong          → output spec improvement

Missing context handling     → edge case improvement

Too slow / too much output   → scope improvement

```


### Diagnostic protocol (when output is wrong)

```

1. READ the skill body top to bottom — what instruction produced this?

2. IDENTIFY the exact failure point (phase? rule? example?)

3. DIAGNOSE the root cause:

   a. Missing instruction?       → ADD

   b. Ambiguous instruction?     → CLARIFY

   c. Wrong instruction?         → FIX

   d. Missing example?           → ADD EXAMPLE

   e. Over-constrained?          → RELAX

   f. Under-constrained?         → TIGHTEN

4. WRITE the fix — explain the WHY

5. TEST with the original failing case + 2 similar ones

6. CONFIRM the fix doesn't break the working cases

```


### Improvement types and when to apply


| Type | When | Action |

|---|---|---|

| **Description patch** | Skill doesn't trigger when it should | Add missing trigger phrases or signals |

| **Phase addition** | Output is missing a component | Add a new phase or step |

| **Anti-pattern addition** | A mistake keeps repeating | Add to the "Avoid" section with explanation |

| **Example addition** | Output format keeps being wrong | Add a concrete before/after example |

| **Scope reduction** | Skill doing too much / too slow | Split into two skills or narrow the scope |

| **Why injection** | Instructions followed blindly, badly | Replace "DO X" with "Do X because Y" |

| **Generalization** | Works for example, fails variations | Abstract the pattern from the specific |


### Version tracking (append to skill file)

```markdown

---


## 📝 Changelog


| Version | Date       | Change                              | Trigger |

|---------|------------|-------------------------------------|---------|

| 1.0     | YYYY-MM-DD | Initial version                     | Created |

| 1.1     | YYYY-MM-DD | Added anti-pattern for X            | User correction |

| 1.2     | YYYY-MM-DD | Expanded trigger list (missing Y)   | Not triggering |

| 2.0     | YYYY-MM-DD | Rewrote output format section       | Wrong output |

```


---


## 🤖 Phase 6 — Meta-Skills (Skills About Skills)


This skill can also build skills that improve other skills.


### The Self-Improvement Pattern


When this skill is used, it should observe its own performance and improve:

```

After each skill creation session:

1. Did the user need to correct the output?          → What instruction was missing?

2. Did the skill fail to trigger during the session? → What trigger phrase to add?

3. Did the output format need adjustment?            → What example to add?

4. Was a phase unclear or ambiguous?                 → How to explain it better?


Then: update this skill's own body with the improvement.

```


### Skill composition patterns


**Pattern: Chain**

```

Skill A output → Skill B input → Skill C output

Example: research-skill → summary-skill → email-skill

```


**Pattern: Conditional**

```

Trigger → Route to Skill A (if condition X) or Skill B (if condition Y)

Example: code-review-skill routes to security-review or performance-review

```


**Pattern: Wrapper**

```

Meta-skill calls sub-skills as phases

Example: project-kickoff-skill runs: research + design + planning sub-skills

```


**Pattern: Feedback loop**

```

Skill produces output → User evaluates → Skill refines → Repeat

Example: This create-skill pattern itself

```


### Generating a skill from a session transcript

```python

def extract_skill_from_transcript(transcript: str) -> str:

    """

    Analyze a Claude Code session and extract a reusable skill.

    Call this when the user says "turn this session into a skill."

    """

    # From the transcript, extract:

    extraction_prompts = {

        "name": "What is the core action being performed? (kebab-case)",

        "triggers": "What would a user say to start this workflow?",

        "phases": "What are the distinct steps taken in this session?",

        "tools": "What tools/commands were used?",

        "corrections": "What corrections did the user make?",

        "output_format": "What was the final output structure?",

        "anti_patterns": "What approaches were tried and abandoned?",

    }

    # Each extraction produces a section of the SKILL.md

    # Corrections → Anti-patterns section

    # Tools → Phase command blocks

    # Output format → Output Format section with example

    # Triggers → Description frontmatter

    pass

```


---


## 📦 Phase 7 — Skill Deployment


### File placement rules

```bash

# Single-file skill (most skills)

~/.claude/skills/{category}/{skill-name}/SKILL.md


# Multi-file skill (when SKILL.md > 300 lines)

~/.claude/skills/{category}/{skill-name}/

├── SKILL.md              ← index, pointers to references

├── references/

│   ├── detailed-guide.md

│   └── examples.md

└── scripts/

    └── helper.py


# Verify it's discoverable

ls ~/.claude/skills/{category}/{skill-name}/SKILL.md

```


### Deployment checklist

```

[ ] Skill name is kebab-case and matches frontmatter name field

[ ] Description is 100–300 words

[ ] At least 10 trigger phrases

[ ] At least one proactive trigger

[ ] At least 3 phases with clear titles

[ ] At least one concrete example

[ ] At least one anti-pattern

[ ] Changelog section initialized

[ ] Placed in correct category folder

[ ] No hardcoded user-specific values (paths, names, keys)

[ ] Self-evaluation checklist passed (Phase 4)

```


### Post-deployment test (always do this)

```

Immediately after saving the skill file:

1. Start a new conversation

2. Try 3 trigger phrases from the description

3. Verify the skill is loaded and applied

4. If it doesn't trigger → fix the description immediately

```


---


## 📊 Phase 8 — Skill Quality Scoring


Use this rubric to score any skill from 0–100.

```

TRIGGERING (30 points)

  +5  — Has 10+ trigger phrases

  +5  — Covers implicit triggers (not just "create a X")

  +5  — Has proactive trigger condition

  +5  — Covers frustration/correction signals

  +5  — Includes domain-specific keywords

  +5  — Has at least one non-obvious trigger


COMPLETENESS (30 points)

  +10 — Output format explicitly defined

  +10 — At least 3 concrete examples

  +10 — Anti-patterns documented with explanations


QUALITY (25 points)

  +5  — Instructions explain "why" not just "what"

  +5  — Generalizable (not overfit to one example)

  +5  — Under 500 lines (or well-organized if longer)

  +5  — Clear phase structure with logical progression

  +5  — No ALL-CAPS MUST commands (reasoning used instead)


META (15 points)

  +5  — Has changelog section

  +5  — Category placement is correct

  +5  — Skill name is descriptive and unique


SCORING

  90–100: 🟢 Excellent — ship it

  70–89:  🟡 Good — minor improvements before shipping

  50–69:  🟠 Needs work — focus on triggering and completeness

  0–49:   🔴 Rebuild — fundamental issues

```


---


## 🧬 Phase 9 — Self-Improvement Protocol


This skill improves itself. After every session where it's used:


### Capture what happened

```

Session debrief (run mentally after each use):


1. TRIGGER: Did the skill trigger at the right moment?

   → If not: which trigger phrase was missing?

   → If over-triggered: which condition was too broad?


2. EXECUTION: Did the workflow phases produce good output?

   → If not: which phase was unclear or missing?

   → What did the user correct?


3. OUTPUT: Was the final skill file high quality?

   → Did it pass the self-evaluation checklist?

   → Did the user need to revise it?


4. META: Did the process feel smooth?

   → Which question took too long to answer?

   → What information should have been captured earlier?

```


### Self-improvement log (append to this file)

```markdown

## 🧬 Learning Log


[YYYY-MM-DD] — [What failed] → [What was changed] → [Section updated]


Example:

[2025-04-01] — Skills not triggering for "remember how to do X" phrasing

              → Added implicit trigger: "remember how to do X" / "always do X this way"

              → Updated: Phase 0 Discovery Mode + Description frontmatter


[2025-04-03] — Generated skills too long (800+ lines), hard to maintain

              → Added 500-line guideline + splitting pattern in Phase 7

              → Updated: Deployment checklist


[2025-04-07] — Users not reading Phase 4 testing protocol, shipping untested skills

              → Added "Post-deployment test" box in Phase 7 (impossible to miss)

              → Updated: Phase 7 Deployment

```


### When to create a new skill vs. improve existing

```

CREATE NEW SKILL when:

  - The use case is genuinely different from any existing skill

  - The trigger conditions don't overlap with existing skills

  - The output format is fundamentally different


IMPROVE EXISTING SKILL when:

  - The output is close but not right

  - A trigger phrase is missing

  - An edge case isn't handled

  - The same mistake happens twice


SPLIT A SKILL when:

  - It's doing two distinct things

  - It's over 500 lines

  - The trigger conditions are getting too broad


DEPRECATE A SKILL when:

  - It hasn't been triggered in 30+ sessions

  - A better skill now covers the same use case

  - The underlying domain has changed fundamentally

```


---


## 🚀 Quick-Start Commands

```bash

# Create a new skill interactively

# (Just describe what you need — Claude does the rest)

"Create a skill for [your use case]"


# Improve an existing skill

"The [skill-name] skill [what's wrong]. Fix it."


# Audit all skills

"Audit my skill library"


# Generate a skill from this session

"Turn what we just did into a skill"


# Score an existing skill

"Score my [skill-name] skill"


# List all skills with health status

find ~/.claude/skills -name "SKILL.md" | wc -l  # count

```


---


## 📚 Reference: Skill Examples by Category


Study these patterns when building skills for specific domains:

```

CODE/ENGINEERING:

  Good trigger: "refactor this", "code review", "write tests for"

  Good phases: Understand → Analyze → Execute → Verify

  Good output: Working code + explanation of changes


WRITING/CONTENT:

  Good trigger: "write a", "draft", "improve this", "make this sound like"

  Good phases: Understand voice → Structure → Write → Polish

  Good output: The content + 1-sentence rationale for key choices


DATA/ANALYSIS:

  Good trigger: "analyze", "what does this data say", "find patterns in"

  Good phases: Load → Clean → Analyze → Visualize → Summarize

  Good output: Insight + supporting data + chart/table


RESEARCH:

  Good trigger: "research", "find information about", "compare"

  Good phases: Query → Retrieve → Synthesize → Cite

  Good output: Structured summary + source list


AUTOMATION:

  Good trigger: "automate", "every time X happens do Y", "schedule"

  Good phases: Design → Build → Test → Deploy → Monitor

  Good output: Working automation + documentation

```


---


*Every great workflow deserves to be a skill.

Every skill deserves to get better.

This one is no exception.*

