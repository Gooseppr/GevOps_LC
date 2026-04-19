"""
ZZ_daily_review.py
------------------
Sélectionne un mix quotidien de snippets par utilisateur et envoie un email HTML via Yahoo SMTP.

Logique de sélection :
  - Chaque utilisateur a sa propre liste de snippets déjà vus (sent_ids)
  - Priorité : importance=high → medium → low
  - Un snippet n'est jamais répété tant que tous n'ont pas été vus
  - Quand le cycle est complet, sent_ids se remet à zéro (nouveau cycle)
  - Le daily_mix de chaque user définit combien de snippets par type

Prérequis :
  1. Avoir lancé Z0_extract_snippets.py pour générer _data/snippets.json
  2. Avoir lancé Z0_setup_password.py pour enregistrer le mot de passe Yahoo
     (stocké dans Windows Credential Manager — jamais en clair sur disque)

Lancement :
  python pipeline/ZZ_daily_review.py
"""

import json
import os
import smtplib
import sys
from datetime import date
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

try:
    import keyring
    KEYRING_AVAILABLE = True
except ImportError:
    KEYRING_AVAILABLE = False

KEYRING_SERVICE = "coursite"
KEYRING_ACCOUNT = "brevo_smtp_key"

# Fix encodage console Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIPELINE_DIR = os.path.dirname(os.path.abspath(__file__))

SNIPPETS_PATH = os.path.join(BASE_DIR,     "_data",       "snippets.json")
CONFIG_PATH   = os.path.join(PIPELINE_DIR, "review_config.json")
SECRETS_PATH  = os.path.join(PIPELINE_DIR, "secrets.json")
STATE_PATH    = os.path.join(PIPELINE_DIR, "review_state.json")

IMPORTANCE_ORDER = ['high', 'medium', 'low']


def tech_match(snippet_tech, filter_tech):
    """Vérifie si la tech d'un snippet correspond au filtre (None | str | list[str])."""
    if filter_tech is None:
        return True
    if isinstance(filter_tech, list):
        return snippet_tech in filter_tech
    return snippet_tech == filter_tech


# ──────────────────────────────────────────────
# Persistance de l'état
# ──────────────────────────────────────────────

def load_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def user_key(name, email):
    """Génère une clé d'état stable combinant nom et email (ex: 'greg_aws|austinpwr@zohomail.eu')."""
    return f"{name.lower().replace(' ', '_')}|{email.lower()}"


def get_user_state(state, name, email):
    """Retourne (et initialise si besoin) l'état d'un utilisateur (indexé par nom + email)."""
    key = user_key(name, email)
    if key not in state['users']:
        state['users'][key] = {
            'sent_ids': [],
            'cycle': 1,
            'last_sent': None,
        }
    return state['users'][key]


# ──────────────────────────────────────────────
# Sélection avec état
# ──────────────────────────────────────────────

def select_snippets_for_user(all_snippets, user_cfg, user_state):
    """
    Sélectionne les snippets du jour pour un utilisateur.
    - Respecte le daily_mix (type + count)
    - Applique les filtres tech/level si définis
    - Évite les snippets déjà envoyés (sent_ids)
    - Ordre configurable par tech via sort_order / tech_order :
        importance    → high → medium → low (défaut)
        chronological → ordre d'apparition dans snippets.json
        random        → ordre aléatoire (différent à chaque exécution)
    - Si le pool restant est insuffisant, complète depuis les anciens (débordement de cycle)
    """
    import random as _rand
    from collections import defaultdict
    from itertools import zip_longest

    sent_ids     = set(user_state['sent_ids'])
    filters      = user_cfg.get('filters', {})
    f_tech       = filters.get('tech')       # None | str | list[str]
    f_level      = filters.get('level')      # None | str
    max_per_tech = user_cfg.get('max_per_tech')
    sort_order   = user_cfg.get('sort_order', 'importance')  # défaut global
    tech_order   = user_cfg.get('tech_order', {})            # surcharge par tech

    # Index de position pour le tri chronologique (ordre dans snippets.json)
    position_index = {s['id']: i for i, s in enumerate(all_snippets)}

    def sort_pool(pool):
        """
        Trie le pool en respectant le mode de chaque tech.
        Les techs sont traitées indépendamment puis interleaved en round-robin
        pour maximiser la diversité dans les premiers éléments.
        """
        groups = defaultdict(list)
        for s in pool:
            groups[s.get('tech', '')].append(s)

        sorted_groups = []
        for tech in sorted(groups):           # ordre alphabétique pour la stabilité
            group = groups[tech]
            mode  = tech_order.get(tech, sort_order)
            if mode == 'random':
                _rand.shuffle(group)
            elif mode == 'chronological':
                group.sort(key=lambda s: position_index.get(s['id'], 9999))
            else:                             # importance (défaut)
                group.sort(key=lambda s: IMPORTANCE_ORDER.index(s.get('importance', 'low'))
                           if s.get('importance', 'low') in IMPORTANCE_ORDER else 99)
            sorted_groups.append(group)

        # Interleaving round-robin : docker[0], go[0], python[0], docker[1], ...
        result = []
        for items in zip_longest(*sorted_groups):
            result.extend(s for s in items if s is not None)
        return result

    # Appliquer les filtres globaux de l'utilisateur
    available = [
        s for s in all_snippets
        if tech_match(s.get('tech'), f_tech)
        and (f_level is None or s.get('level') == f_level)
    ]

    selection   = []
    tech_counts = {}   # diversité : nb de snippets déjà choisis par tech ce jour

    def pick_with_diversity(pool, count):
        """Sélectionne `count` snippets en respectant max_per_tech."""
        picked = []
        for snippet in pool:
            if len(picked) >= count:
                break
            t = snippet.get('tech', '')
            if max_per_tech and tech_counts.get(t, 0) >= max_per_tech:
                continue
            picked.append(snippet)
            tech_counts[t] = tech_counts.get(t, 0) + 1
        return picked

    for rule in user_cfg.get('daily_mix', []):
        stype   = rule.get('type')
        count   = rule.get('count', 1)
        r_tech  = rule.get('tech',  f_tech)
        r_level = rule.get('level', f_level)

        pool_all = [
            s for s in available
            if s.get('type') == stype
            and tech_match(s.get('tech'), r_tech)
            and (r_level is None or s.get('level') == r_level)
        ]

        if not pool_all:
            print(f"  ⚠️  Aucun snippet pour type={stype} tech={r_tech} level={r_level}")
            continue

        unseen = sort_pool([s for s in pool_all if s['id'] not in sent_ids])
        picked = pick_with_diversity(unseen, count)

        # Compléter depuis les déjà-vus si le pool non-vu est épuisé
        if len(picked) < count:
            already_seen = sort_pool([s for s in pool_all if s['id'] in sent_ids])
            picked += pick_with_diversity(already_seen, count - len(picked))

        selection.extend(picked)

    return selection


def check_and_rotate_cycle(all_snippets, user_cfg, user_state):
    """
    Vérifie si tous les snippets applicables ont été vus.
    Si oui, remet sent_ids à zéro et incrémente le cycle.
    """
    filters = user_cfg.get('filters', {})
    f_tech  = filters.get('tech')
    f_level = filters.get('level')

    total = len([
        s for s in all_snippets
        if tech_match(s.get('tech'), f_tech)
        and (f_level is None or s.get('level') == f_level)
    ])

    seen = len(user_state['sent_ids'])
    if total > 0 and seen >= total:
        user_state['cycle'] += 1
        user_state['sent_ids'] = []
        print(f"  🔄 Cycle {user_state['cycle'] - 1} terminé — nouveau cycle #{user_state['cycle']} démarré")
        return True
    return False


def update_state(user_state, selected):
    """Ajoute les IDs sélectionnés à sent_ids (sans doublons)."""
    existing = set(user_state['sent_ids'])
    for s in selected:
        existing.add(s['id'])
    user_state['sent_ids'] = list(existing)
    user_state['last_sent'] = date.today().isoformat()


# ──────────────────────────────────────────────
# Rendu HTML
# ──────────────────────────────────────────────

TYPE_META = {
    'command': {
        'emoji': '⌨️', 'label': 'Commande',
        'accent': '#2563eb', 'bg': '#eff6ff', 'badge_bg': '#dbeafe', 'badge_color': '#1d4ed8',
    },
    'concept': {
        'emoji': '🧠', 'label': 'Concept',
        'accent': '#16a34a', 'bg': '#f0fdf4', 'badge_bg': '#dcfce7', 'badge_color': '#15803d',
    },
    'warning': {
        'emoji': '⚠️', 'label': 'Piège à éviter',
        'accent': '#ea580c', 'bg': '#fff7ed', 'badge_bg': '#ffedd5', 'badge_color': '#c2410c',
    },
    'tip': {
        'emoji': '💡', 'label': 'Astuce',
        'accent': '#0891b2', 'bg': '#f0f9ff', 'badge_bg': '#e0f2fe', 'badge_color': '#0369a1',
    },
    'error': {
        'emoji': '🚫', 'label': 'Erreur fréquente',
        'accent': '#dc2626', 'bg': '#fef2f2', 'badge_bg': '#fee2e2', 'badge_color': '#b91c1c',
    },
}


def render_inline_code(text):
    """Convertit les `backticks` en balises <code> HTML."""
    import re

    def _replace(m):
        inner = m.group(1).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        return (
            '<code style="background:#f1f5f9;color:#0f172a;padding:1px 5px;'
            "border-radius:4px;font-family:'Courier New',monospace;font-size:13px;\">"
            f'{inner}</code>'
        )

    return re.sub(r'`([^`]+)`', _replace, text)


def render_command(text):
    """
    Échappe le HTML d'une commande shell, mais met en valeur les variables <VAR>
    avec un style distinct (italique coloré) pour les distinguer des valeurs littérales.
    """
    import re
    # Échappement HTML standard
    escaped = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    # Remettre en forme les variables &lt;VAR&gt; → <span> stylé
    styled = re.sub(
        r'&lt;([A-Z0-9_\.]+)&gt;',
        r'<span style="color:#7c3aed;font-style:italic;">&lt;\1&gt;</span>',
        escaped,
    )
    return styled


def render_content(text):
    """
    Convertit le texte d'un champ content en HTML.
    Supporte :
      - Les listes non-ordonnées  (lignes commençant par "- ")
      - Les listes ordonnées      (lignes commençant par "1. ", "2. ", …)
      - Le texte brut             (paragraphes)
    Les blocs de liste et les paragraphes peuvent se mélanger.
    """
    import re

    P_STYLE  = 'margin:10px 0;color:#374151;font-size:14px;line-height:1.6;'
    UL_STYLE = 'margin:10px 0 10px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.7;'
    OL_STYLE = 'margin:10px 0 10px 0;padding-left:20px;color:#374151;font-size:14px;line-height:1.7;'
    LI_STYLE = 'margin:2px 0;'

    lines = text.splitlines()
    html_parts = []
    buffer = []        # lignes de texte courant
    list_type = None   # 'ul' | 'ol' | None

    def flush_text():
        if buffer:
            merged = ' '.join(l.strip() for l in buffer if l.strip())
            if merged:
                html_parts.append(
                    f'<p style="{P_STYLE}">{render_inline_code(merged)}</p>'
                )
            buffer.clear()

    def flush_list(items, tag, style):
        if items:
            lis = ''.join(
                f'<li style="{LI_STYLE}">{render_inline_code(item)}</li>'
                for item in items
            )
            html_parts.append(f'<{tag} style="{style}">{lis}</{tag}>')

    list_items = []

    for line in lines:
        stripped = line.strip()
        is_ul = stripped.startswith('- ') and len(stripped) > 2
        is_ol = bool(re.match(r'^\d+\.\s', stripped))

        if is_ul:
            if list_type == 'ol':
                flush_list(list_items, 'ol', OL_STYLE)
                list_items = []
            flush_text()
            list_type = 'ul'
            list_items.append(stripped[2:].strip())
        elif is_ol:
            if list_type == 'ul':
                flush_list(list_items, 'ul', UL_STYLE)
                list_items = []
            flush_text()
            list_type = 'ol'
            list_items.append(re.sub(r'^\d+\.\s*', '', stripped))
        else:
            if list_type:
                flush_list(list_items, list_type, UL_STYLE if list_type == 'ul' else OL_STYLE)
                list_items = []
                list_type = None
            if stripped:
                buffer.append(stripped)
            else:
                flush_text()

    # Vider les buffers restants
    flush_text()
    if list_type:
        flush_list(list_items, list_type, UL_STYLE if list_type == 'ul' else OL_STYLE)

    return '\n'.join(html_parts)


SITE_BASE_URL = "https://gooseppr.github.io/GevOps_LC"


def source_to_url(source_file):
    """Convertit un chemin source_file en URL publique du site Jekyll."""
    path = source_file.replace('.md', '.html')
    return f"{SITE_BASE_URL}/{path}"


def render_snippet(s):
    stype  = s.get('type', 'concept')
    meta   = TYPE_META.get(stype, {
        'emoji': '📌', 'label': stype.capitalize(),
        'accent': '#6b7280', 'bg': '#f9fafb', 'badge_bg': '#f3f4f6', 'badge_color': '#374151',
    })
    accent      = meta['accent']
    bg          = meta['bg']
    badge_bg    = meta['badge_bg']
    badge_color = meta['badge_color']
    emoji       = meta['emoji']
    label       = meta['label']
    tech        = s.get('tech', '').upper()
    title       = s.get('title', s.get('id', ''))
    importance  = s.get('importance', 'medium')

    # Badge type
    type_badge = (
        f'<span style="display:inline-block;background:{badge_bg};color:{badge_color};'
        f'padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">'
        f'{emoji} {label}</span>'
    )

    # Badge tech
    tech_badge = (
        f'<span style="display:inline-block;background:#f3f4f6;color:#6b7280;'
        f'padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">'
        f'{tech}</span>'
    ) if tech else ''

    # Badge importance high
    imp_badge = (
        f'<span style="display:inline-block;background:#fef9c3;color:#854d0e;'
        f'padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">★ Essentiel</span>'
    ) if importance == 'high' else ''

    # Bloc code (fond clair type GitHub)
    body_html = ''
    if s.get('command'):
        cmd = render_command(s['command'])
        body_html += (
            f'<div style="background:#f6f8fa;border:1px solid #e2e8f0;border-radius:8px;'
            f'padding:14px 16px;margin:12px 0;overflow-x:auto;">'
            f'<code style="font-family:\'Courier New\',Courier,monospace;font-size:14px;'
            f'color:#1e293b;white-space:pre-wrap;word-break:break-all;">{cmd}</code>'
            f'</div>'
        )

    if s.get('example'):
        ex = render_command(s['example'])
        body_html += (
            f'<div style="margin:-4px 0 12px 0;">'
            f'<div style="font-size:11px;color:#6b7280;font-family:system-ui,sans-serif;'
            f'margin-bottom:4px;font-weight:600;letter-spacing:0.04em;">▶ Exemple concret</div>'
            f'<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;'
            f'padding:12px 16px;overflow-x:auto;">'
            f'<code style="font-family:\'Courier New\',Courier,monospace;font-size:14px;'
            f'color:#166534;white-space:pre-wrap;word-break:break-all;">{ex}</code>'
            f'</div>'
            f'</div>'
        )

    if s.get('context'):
        body_html += (
            f'<p style="margin:8px 0 4px;color:#64748b;font-size:13px;">'
            f'<em>📍 {render_inline_code(s["context"])}</em></p>'
        )

    if s.get('content'):
        body_html += render_content(s['content'])

    if s.get('description'):
        body_html += (
            f'<p style="margin:6px 0;color:#64748b;font-size:13px;font-style:italic;">'
            f'{render_inline_code(s["description"])}</p>'
        )

    # Tags
    tags = s.get('tags', [])
    tags_html = ''.join(
        f'<span style="display:inline-block;background:#f1f5f9;color:#94a3b8;'
        f'padding:2px 8px;border-radius:12px;font-size:11px;margin:2px 2px 0 0;">'
        f'#{t}</span>'
        for t in tags
    )

    return f'''
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
  <tr>
    <td style="background:{bg};border-left:4px solid {accent};border-radius:8px;
               padding:16px 20px;font-family:system-ui,-apple-system,sans-serif;">
      <!-- badges -->
      <div style="margin-bottom:10px;">
        {type_badge}&nbsp;{tech_badge}&nbsp;{imp_badge}
      </div>
      <!-- titre -->
      <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:10px;
                  line-height:1.3;">{title}</div>
      <!-- contenu -->
      {body_html}
      <!-- tags + lien cours -->
      <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:6px;">
        <div>{tags_html}</div>
        {f'<a href="{source_to_url(s["source_file"])}" style="display:inline-block;font-size:12px;color:{accent};text-decoration:none;font-weight:600;white-space:nowrap;" target="_blank">Voir le cours →</a>' if s.get('source_file') else ''}
      </div>
    </td>
  </tr>
</table>'''


def build_email_html(snippets, today_str, user_name, cycle, total_seen, total_available):
    cards    = '\n'.join(render_snippet(s) for s in snippets)
    count    = len(snippets)
    percent  = round(total_seen / total_available * 100) if total_available else 0
    bar_fill = max(4, percent)  # minimum visible

    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:24px 16px;">

      <!-- Conteneur principal -->
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;background:#ffffff;
                    border-radius:12px;overflow:hidden;
                    box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- En-tête -->
        <tr>
          <td style="background:#2563eb;padding:24px 28px;">
            <div style="font-size:13px;color:#bfdbfe;font-family:system-ui,sans-serif;
                        margin-bottom:4px;">📚 Coursite · Pense-bête du jour</div>
            <div style="font-size:22px;font-weight:700;color:#ffffff;
                        font-family:system-ui,sans-serif;">Bonjour {user_name} 👋</div>
            <div style="font-size:14px;color:#bfdbfe;margin-top:4px;
                        font-family:system-ui,sans-serif;">{today_str}</div>
          </td>
        </tr>

        <!-- Sous-titre -->
        <tr>
          <td style="padding:16px 28px 8px;border-bottom:1px solid #f1f5f9;">
            <div style="font-size:14px;color:#64748b;font-family:system-ui,sans-serif;">
              Voici tes <strong style="color:#1e293b;">{count} rappels du jour</strong>
              — ça prend 2 minutes à parcourir&nbsp;☕
            </div>
            <!-- barre de progression -->
            <div style="margin-top:12px;">
              <div style="display:flex;justify-content:space-between;
                          font-size:11px;color:#94a3b8;margin-bottom:4px;
                          font-family:system-ui,sans-serif;">
                <span>Cycle #{cycle} en cours</span>
                <span>{total_seen} / {total_available} vus ce cycle ({percent}%)</span>
              </div>
              <div style="background:#e2e8f0;border-radius:99px;height:6px;overflow:hidden;">
                <div style="background:#2563eb;height:6px;width:{bar_fill}%;
                            border-radius:99px;"></div>
              </div>
            </div>
          </td>
        </tr>

        <!-- Cartes snippets -->
        <tr>
          <td style="padding:20px 28px;">
            {cards}
          </td>
        </tr>

        <!-- Pied de page -->
        <tr>
          <td style="background:#f8fafc;padding:16px 28px;border-top:1px solid #e2e8f0;">
            <div style="font-size:12px;color:#94a3b8;font-family:system-ui,sans-serif;">
              Tu reçois cet email quotidiennement · Coursite révision automatique
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>'''


# ──────────────────────────────────────────────
# Envoi SMTP
# ──────────────────────────────────────────────

def send_email(html_body, to_email, user_name, smtp_cfg, subject_template, password):
    today_str = date.today().strftime('%d/%m/%Y')
    subject   = subject_template.format(date=today_str, name=user_name)
    from_addr    = smtp_cfg['login']
    from_display = smtp_cfg.get('from_email', from_addr)

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From']    = from_display
    msg['To']      = to_email
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    host = smtp_cfg['host']
    port = smtp_cfg.get('port', 587)
    print(f"  Connexion à {host}:{port} (STARTTLS) …")
    with smtplib.SMTP(host, port) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(from_addr, password)
        server.sendmail(from_addr, to_email, msg.as_string())

    print(f"  ✅ Email envoyé à {to_email}")


# ──────────────────────────────────────────────
# Chargement du mot de passe
# ──────────────────────────────────────────────

def _load_password(secrets):
    """
    Charge la clé SMTP Brevo.
    Ordre de priorité :
      1. Variable d'environnement BREVO_SMTP_KEY (GitHub Actions)
      2. Windows Credential Manager (keyring) — usage local
      3. secrets.json — fallback legacy
    """
    # 1. Variable d'environnement (GitHub Actions / CI)
    pwd = os.environ.get('BREVO_SMTP_KEY', '')
    if pwd:
        print("  🔐 Clé Brevo chargée depuis variable d'environnement")
        return pwd

    # 2. Windows Credential Manager
    if KEYRING_AVAILABLE:
        pwd = keyring.get_password(KEYRING_SERVICE, KEYRING_ACCOUNT)
        if pwd:
            print("  🔐 Clé Brevo chargée depuis Windows Credential Manager")
            return pwd

    # 3. Fallback secrets.json
    pwd = secrets.get('brevo_smtp_key', '')
    if pwd and not pwd.startswith('REMPLACE'):
        print("  ⚠️  Clé Brevo chargée depuis secrets.json (pense à migrer vers keyring)")
        return pwd

    print("❌ Clé SMTP Brevo introuvable.")
    if KEYRING_AVAILABLE:
        print("   → Lance : python pipeline/Z0_setup_password.py")
    else:
        print("   → pip install keyring  puis  python pipeline/Z0_setup_password.py")
        print("   → Ou remplis pipeline/secrets.json avec 'brevo_smtp_key'")
    return None


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Coursite — Daily Review')
    parser.add_argument('--user', metavar='NOM_OU_EMAIL',
                        help='Envoyer uniquement pour cet utilisateur (nom ou email)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Génère le HTML sans envoyer ni modifier l\'état (fichiers : dry_run_<nom>.html)')
    args = parser.parse_args()

    print("📬 Coursite — Daily Review\n")
    if args.dry_run:
        print("🧪 Mode dry-run — aucun email ne sera envoyé, état inchangé\n")

    for path, label in [
        (SNIPPETS_PATH, "snippets.json"),
        (CONFIG_PATH,   "review_config.json"),
    ]:
        if not os.path.exists(path):
            print(f"❌ Fichier manquant : {path}")
            if "snippets" in label:
                print("   → Lance Z0_extract_snippets.py avant ce script.")
            return

    snippets = load_json(SNIPPETS_PATH)
    config   = load_json(CONFIG_PATH)
    # secrets.json est optionnel (fallback si keyring non disponible)
    secrets  = load_json(SECRETS_PATH) if os.path.exists(SECRETS_PATH) else {}

    # Créer review_state.json s'il n'existe pas
    if not os.path.exists(STATE_PATH):
        save_json(STATE_PATH, {"users": {}})
    state = load_json(STATE_PATH)

    if not args.dry_run:
        password = _load_password(secrets)
        if not password:
            return
    else:
        password = None

    smtp_cfg          = config['smtp']
    subject_template  = config.get('subject_template', 'Révision du {date} — {name}')
    # Filtrage par jour de la semaine (configurable par utilisateur)
    # Accepte français (lun, lundi) et anglais (mon) pour chaque jour
    DAY_ALIASES = {
        0: ['lun', 'lundi', 'mon'],
        1: ['mar', 'mardi', 'tue'],
        2: ['mer', 'mercredi', 'wed'],
        3: ['jeu', 'jeudi', 'thu'],
        4: ['ven', 'vendredi', 'fri'],
        5: ['sam', 'samedi', 'sat'],
        6: ['dim', 'dimanche', 'sun'],
    }
    today_aliases = DAY_ALIASES[date.today().weekday()]
    today_label = today_aliases[1]  # nom complet français pour l'affichage
    ALL_DAYS = [alias for aliases in DAY_ALIASES.values() for alias in aliases]

    def is_today(user_days):
        return any(d.lower() in today_aliases for d in user_days)

    all_active = [u for u in config.get('users', []) if u.get('active', True)]
    active_users = [
        u for u in all_active
        if is_today(u.get('days', ALL_DAYS))
    ]

    skipped = len(all_active) - len(active_users)
    if skipped:
        print(f"📅 {skipped} utilisateur(s) non prévu(s) aujourd'hui ({today_label})\n")

    if not all_active:
        print("❌ Aucun utilisateur actif dans review_config.json")
        return

    if not active_users and not args.user:
        print(f"📅 Aucun utilisateur prévu pour aujourd'hui ({today_label}). Rien à envoyer.")
        return

    if args.user:
        target = args.user.lower()
        # --user ignore le filtre de jour (permet de tester n'importe quand)
        active_users = [u for u in all_active
                        if u['name'].lower() == target or u['email'].lower() == target]
        if not active_users:
            print(f"❌ Utilisateur '{args.user}' introuvable ou inactif.")
            return

    if not active_users:
        print("❌ Aucun utilisateur actif dans review_config.json")
        return

    print(f"  {len(snippets)} snippets chargés\n")

    for user in active_users:
        email = user['email']
        name  = user['name']
        print(f"─── {name} ({email})")

        user_state = get_user_state(state, name, email)

        # Vérifier si cycle terminé avant la sélection
        check_and_rotate_cycle(snippets, user, user_state)

        # Sélection du jour
        selected = select_snippets_for_user(snippets, user, user_state)
        if not selected:
            print(f"  ❌ Aucun snippet sélectionné. Vérifie daily_mix et tes snippets.")
            continue

        # Stats avant update
        filters     = user.get('filters', {})
        f_tech      = filters.get('tech')
        f_level     = filters.get('level')
        total_avail = len([
            s for s in snippets
            if tech_match(s.get('tech'), f_tech)
            and (f_level is None or s.get('level') == f_level)
        ])
        total_seen_before = len(user_state['sent_ids'])

        print(f"  {len(selected)} snippets sélectionnés :")
        for s in selected:
            importance_marker = ' ★' if s.get('importance') == 'high' else ''
            print(f"    [{s['type']:8s}] [{s.get('tech','?'):12s}] {s['id']}{importance_marker}")

        # Construire l'email
        today_str = date.today().strftime('%d %B %Y')
        html = build_email_html(
            selected, today_str, name,
            user_state['cycle'],
            total_seen_before + len(selected),
            total_avail,
        )

        if args.dry_run:
            out_path = os.path.join(PIPELINE_DIR, f"dry_run_{name.lower()}.html")
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"  💾 HTML écrit dans {out_path} (pas d'envoi)\n")
            continue

        try:
            send_email(html, email, name, smtp_cfg, subject_template, password)
        except Exception as e:
            print(f"  ❌ Échec envoi email pour {name} : {e}")
            print(f"  ⚠️  État non mis à jour pour {name} (sera renvoyé demain)\n")
            continue

        # Mettre à jour l'état après envoi réussi
        update_state(user_state, selected)
        print(f"  📊 Progression : {len(user_state['sent_ids'])}/{total_avail} "
              f"(cycle #{user_state['cycle']})\n")

    if args.dry_run:
        print("🧪 Dry-run terminé — état non modifié.")
        return

    # Sauvegarder l'état mis à jour (même si certains envois ont échoué)
    save_json(STATE_PATH, state)
    print("✅ État sauvegardé dans review_state.json")


if __name__ == '__main__':
    main()
