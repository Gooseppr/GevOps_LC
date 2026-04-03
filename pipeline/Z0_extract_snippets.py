"""
Z0_extract_snippets.py
----------------------
Scanne tous les fichiers .md dans courses/ et modules/
et extrait les blocs <!-- snippet ... --> vers _data/snippets.json

Format complet d'un snippet :

<!-- snippet
id: docker_compose_up
type: command              # command | concept | warning | tip | error
tech: docker
level: beginner            # beginner | intermediate | advanced
importance: high           # high | medium | low
format: knowledge          # knowledge | quiz | recall
tags: compose,stack
title: Lancer une stack Compose
context: gérer une stack multi-conteneurs
command: docker compose up -d        # OBLIGATOIRE si type=command
content: texte explicatif            # OBLIGATOIRE si type=concept|warning|tip|error
description: Lance tous les services en arrière-plan  # OBLIGATOIRE si type=command
-->

Règles de validation :
  - type=command   → command + description obligatoires
  - type=concept   → content obligatoire
  - type=warning|tip|error → content obligatoire
"""

import os
import re
import json
import sys
from collections import Counter

# Fix encodage console Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SCAN_DIRS = [
    os.path.join(BASE_DIR, "courses"),
    os.path.join(BASE_DIR, "modules"),
]
OUTPUT_PATH = os.path.join(BASE_DIR, "_data", "snippets.json")

SNIPPET_RE = re.compile(r'<!--\s*snippet\s*\n(.*?)-->', re.DOTALL)
VALID_TYPES = {"command", "concept", "warning", "tip", "error"}


def parse_snippet_block(block, source_file):
    """Parse un bloc snippet en dictionnaire."""
    snippet = {}
    lines = block.strip().splitlines()
    current_key = None
    current_lines = []

    for line in lines:
        m = re.match(r'^(\w+):\s*(.*)', line)
        if m:
            # Sauvegarder la clé précédente
            if current_key:
                snippet[current_key] = '\n'.join(current_lines).strip()
            current_key = m.group(1)
            current_lines = [m.group(2)]
        elif current_key:
            current_lines.append(line.strip())

    if current_key:
        snippet[current_key] = '\n'.join(current_lines).strip()

    # Normaliser les tags en liste
    if 'tags' in snippet:
        raw = snippet['tags'].strip('[]')
        snippet['tags'] = [t.strip() for t in raw.split(',') if t.strip()]
    else:
        snippet['tags'] = []

    # Valeurs par défaut pour les nouveaux champs
    snippet.setdefault('importance', 'medium')
    snippet.setdefault('format', 'knowledge')
    snippet.setdefault('context', '')

    # Chemin relatif pour la portabilité
    snippet['source_file'] = os.path.relpath(source_file, BASE_DIR).replace('\\', '/')
    return snippet


def validate_snippet(s, filepath):
    """Vérifie que les champs obligatoires sont présents selon le type."""
    sid = s.get('id', '?')
    stype = s.get('type', '')
    warnings = []

    if not s.get('id'):
        return False, "pas d'id"
    if not stype:
        return False, "pas de type"
    if stype not in VALID_TYPES:
        return False, f"type inconnu '{stype}'"

    if stype == 'command':
        if not s.get('command'):
            warnings.append(f"  ⚠️  [{sid}] type=command sans 'command'")
        if not s.get('description'):
            warnings.append(f"  ⚠️  [{sid}] type=command sans 'description'")
    elif stype in ('concept', 'warning', 'tip', 'error'):
        if not s.get('content'):
            warnings.append(f"  ⚠️  [{sid}] type={stype} sans 'content'")

    for w in warnings:
        print(w)
    return True, None


def extract_from_file(filepath):
    """Extrait tous les snippets d'un fichier .md."""
    with open(filepath, encoding='utf-8') as f:
        content = f.read()

    snippets = []
    for match in SNIPPET_RE.finditer(content):
        s = parse_snippet_block(match.group(1), filepath)
        ok, reason = validate_snippet(s, filepath)
        if not ok:
            print(f"  ⚠️  Snippet ignoré dans {os.path.basename(filepath)} : {reason}")
            continue
        snippets.append(s)
    return snippets


def main():
    all_snippets = []
    file_count = 0

    for scan_dir in SCAN_DIRS:
        for root, _, files in os.walk(scan_dir):
            for fname in sorted(files):
                if fname.endswith('.md'):
                    path = os.path.join(root, fname)
                    extracted = extract_from_file(path)
                    if extracted:
                        file_count += 1
                        all_snippets.extend(extracted)

    # Avertir sur les IDs en double
    ids = [s['id'] for s in all_snippets]
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        print(f"\n⚠️  IDs en double détectés ({len(dupes)}) :")
        for d in sorted(dupes):
            sources = [s['source_file'] for s in all_snippets if s['id'] == d]
            print(f"   {d}")
            for src in sources:
                print(f"     → {src}")

    # Écrire le JSON
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(all_snippets, f, ensure_ascii=False, indent=2)

    # Statistiques
    counts      = Counter(s.get('type', '?')       for s in all_snippets)
    techs       = Counter(s.get('tech', '?')       for s in all_snippets)
    importances = Counter(s.get('importance', '?') for s in all_snippets)
    formats     = Counter(s.get('format', '?')     for s in all_snippets)

    # Champs manquants (snippets legacy sans les nouveaux champs)
    missing_importance = sum(1 for s in all_snippets if not s.get('importance') or s['importance'] == 'medium' and 'importance' not in s.get('source_file',''))
    no_context = sum(1 for s in all_snippets if not s.get('context'))

    print(f"\n✅ {len(all_snippets)} snippets extraits depuis {file_count} fichiers")
    print(f"   Sortie : {OUTPUT_PATH}\n")
    print("   Par type :")
    for t, n in sorted(counts.items()):
        print(f"     {t:<12} {n}")
    print("\n   Par tech :")
    for t, n in sorted(techs.items()):
        print(f"     {t:<12} {n}")
    print("\n   Par importance :")
    for t, n in sorted(importances.items()):
        print(f"     {t:<12} {n}")
    print("\n   Par format :")
    for t, n in sorted(formats.items()):
        print(f"     {t:<12} {n}")
    if no_context:
        print(f"\n   ℹ️  {no_context} snippets sans champ 'context' (legacy)")


if __name__ == '__main__':
    main()
