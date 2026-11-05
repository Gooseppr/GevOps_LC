#!/usr/bin/env python3
"""Repère, sans rendu ni API, les schémas Mermaid à regarder de plus près.

Usage : python lint_mermaid.py courses/grafana courses/docker/docker_ch1_0.md
Les signalements sont des risques à juger, pas des défauts certains.
"""
from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

MAX_NODES = 15
MAX_LR_STEPS = 5
MAX_LABEL = 55
MAX_EDGES = 16
MAX_MESSAGES = 16
MAX_PARTICIPANTS = 6
PALETTE = {"#dbeafe", "#dcfce7", "#ede9fe", "#fef3c7", "#fee2e2"}
# Mots souvent écrits sans accent dans des labels
UNACCENTED = re.compile(
    r"(?<![\wÀ-ÿ])(metriques?|requetes?|series|resultats?|hotes?|echec|etat|securite|reseaux?|donnees|reponses?|"
    r"memoire|detection|verifier|probleme|acces|regles?|telemetrie|scenarios?|criteres?|"
    r"DONNEES|RESEAUX?|SECURITE|VERIFICATION|VULNERABILITES?|REMEDIATION|METRIQUES?|PERIMETRE)(?![\wÀ-ÿ])"
)
MISSING_APOSTROPHE = re.compile(r"(?<![\w'])[dl] (?=[aeéèiouhy])")
RESERVED = re.compile(r"(?:^|\s)end(?:\s|$)")


def longest_path(edges: list[tuple[str, str]]) -> int:
    graph = defaultdict(list)
    for a, b in edges:
        graph[a].append(b)

    def walk(node: str, seen: tuple[str, ...]) -> int:
        return 1 + max((walk(n, seen + (node,)) for n in graph[node] if n not in seen), default=0)

    return max((walk(n, ()) for n in list(graph)), default=0)


def check_flowchart(code: str, head: str) -> list[str]:
    issues = []
    ids = set(re.findall(r"(?:^|[\s&>|-])([A-Za-z_]\w*)\s*(?:\[|\(|\{)", code, re.M))
    edges = re.findall(
        r"(\w+)\s*(?:\[[^\]]*\]|\{[^}]*\}|\([^)]*\))?\s*(?:-->|-\.->|==>|---|-\.-)\s*(?:\|[^|]*\|\s*)?(\w+)", code
    )
    labels = re.findall(r'[\[({]+"?([^\]\)}"]+)"?[\]\)}]+', code)
    longest_label = max((len(part) for l in labels for part in l.split("<br/>")), default=0)
    parts = head.split()
    direction = parts[1] if len(parts) > 1 else "?"
    steps = longest_path(edges)
    if direction in ("LR", "RL") and steps > MAX_LR_STEPS:
        issues.append(f"{direction} sur {steps} étapes : préférer TD")
    if direction in ("LR", "RL") and "subgraph" in code:
        issues.append(f"{direction} avec zones : risque de schéma très large")
    if len(ids) > MAX_NODES:
        issues.append(f"{len(ids)} nœuds : regrouper ou découper")
    if len(edges) >= MAX_EDGES:
        issues.append(f"{len(edges)} liens : regrouper ou découper")
    if longest_label >= MAX_LABEL:
        issues.append(f"libellé de {longest_label} caractères")
    if len(ids) >= 11 and "subgraph" not in code:
        issues.append("dense et sans zone")
    return issues


def check_sequence(code: str) -> list[str]:
    issues = []
    messages = re.findall(r"(?:->>|-->>|--x|-x|-->|->)", code)
    participants = re.findall(r"^\s*participant ", code, re.M)
    if len(messages) >= MAX_MESSAGES:
        issues.append(f"{len(messages)} messages : découper")
    if len(participants) >= MAX_PARTICIPANTS:
        issues.append(f"{len(participants)} participants")
    long_messages = [len(l.split(":", 1)[1]) for l in code.split("\n") if ":" in l and ">" in l]
    if long_messages and max(long_messages) >= 60:
        issues.append(f"message de {max(long_messages)} caractères")
    return issues


def check_common(code: str) -> list[str]:
    issues = []
    text = "\n".join(l for l in code.split("\n") if not re.match(r"\s*(classDef|class|style|linkStyle)\b", l))
    if "`" in text:
        issues.append("backticks dans un label : ils cassent le rendu du site")
    html = {t for t in re.findall(r"</?([a-zA-Z]+)[^>]*>", text) if t.lower() != "br"}
    if html:
        issues.append("HTML interdit : " + ", ".join(sorted(html)))
    words = sorted(set(UNACCENTED.findall(text)))
    if words:
        issues.append("accents à vérifier : " + ", ".join(words))
    if MISSING_APOSTROPHE.search(text):
        issues.append("apostrophe manquante, par exemple « d erreur »")
    fills = {f.lower() for f in re.findall(r"fill:(#[0-9a-fA-F]{3,8})", code)}
    other = sorted(fills - PALETTE)
    if other:
        issues.append("couleur hors palette : " + ", ".join(other))
    if len(fills) >= 5:
        issues.append("beaucoup de couleurs : garder ce qui porte le message")
    if RESERVED.search(re.sub(r"^\s*end\s*$", "", text, flags=re.M)):
        issues.append("mot réservé end dans un label : le mettre entre guillemets")
    return issues


def files_from(targets: list[str]) -> list[Path]:
    files: list[Path] = []
    for target in targets:
        path = Path(target)
        files += sorted(path.rglob("*.md")) if path.is_dir() else [path]
    return files


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    total = flagged = 0
    for f in files_from(sys.argv[1:]):
        raw = f.read_text(encoding="utf-8").replace("\r\n", "\n")
        if re.search(r"^published:\s*false", raw, re.M):
            continue
        text = re.sub(r"<!-- snippet.*?-->", "", raw, flags=re.S)
        diagrams = list(re.finditer(r"^```mermaid\n(.*?)^```", text, re.S | re.M))
        if diagrams and not re.search(r"^mermaid:\s*true", raw, re.M):
            print(f"{f} : frontmatter sans mermaid: true (convention)")
        for m in diagrams:
            total += 1
            code = m.group(1)
            head = code.strip().split("\n")[0].strip() if code.strip() else ""
            kind = head.split()[0] if head else ""
            issues = check_common(code)
            if kind in ("flowchart", "graph"):
                issues = check_flowchart(code, head) + issues
            elif kind == "sequenceDiagram":
                issues = check_sequence(code) + issues
            if issues:
                flagged += 1
                section = ""
                for h in re.finditer(r"^#{2,4} (.*)$", text[: m.start()], re.M):
                    section = h.group(1)
                line = text[: m.start()].count("\n") + 2
                print(f"{f}:{line} [{kind}] § {section[:50]}\n    - " + "\n    - ".join(issues))
    print(f"\n{total} schéma(s), {flagged} à regarder.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
