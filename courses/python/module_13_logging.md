---
layout: page
title: "Logging & observabilité en Python"

course: python
theme: "python"
type: lesson

chapter: 2
section: 13

tags: python,logging,observabilite,logs,monitoring
difficulty: intermediate
duration: 85
mermaid: false

theme_icon: "🐍"
theme_group: programming
theme_group_icon: "💻"
theme_order: 13
status: "draft"
---

# Logging & observabilité en Python

## Objectifs pédagogiques
- Comprendre le rôle du logging en production
- Utiliser le module logging correctement
- Structurer des logs exploitables
- Différencier logs, metrics et traces

## Contexte
En production, tu ne peux pas “print” pour comprendre ce qui se passe. Le logging est la base de toute observabilité.

## Principe de fonctionnement

🧠 Concept clé — Logging  
Enregistrement des événements d’une application.

💡 Astuce — Les logs doivent être exploitables par des outils (ELK, Loki)

⚠️ Erreur fréquente — utiliser print  
→ pas structuré, pas filtrable

---

## Syntaxe ou utilisation

### Logging basique

```python
import logging

logging.basicConfig(level=logging.INFO)

logging.info("Application démarrée")
logging.error("Erreur détectée")
```

---

### Niveaux de logs

- DEBUG → détails techniques
- INFO → fonctionnement normal
- WARNING → comportement inattendu
- ERROR → erreur
- CRITICAL → crash

---

### Logger avancé ⭐

```python
logger = logging.getLogger(__name__)

logger.info("Message")
```

---

## Cas d'utilisation

### Cas simple
Tracer une exécution

### Cas réel
API backend :

- logs requêtes
- logs erreurs
- monitoring production

---

## Erreurs fréquentes

⚠️ Trop de logs  
→ bruit inutile

⚠️ Pas assez de logs  
→ debug impossible

💡 Astuce : logguer les points critiques uniquement

---

## Bonnes pratiques

🔧 Utiliser logging et pas print  
🔧 Structurer les messages  
🔧 Inclure contexte (user, id, etc.)  
🔧 Utiliser niveaux correctement  
🔧 Centraliser les logs  
🔧 Prévoir rotation logs  

---

## Résumé

| Concept | Ce qu'il fait | À retenir |
|--------|-------------|----------|
| logging | trace events | essentiel |
| niveaux | filtrage | critique |
| observabilité | comprendre prod | obligatoire |

---

## SNIPPETS DE RÉVISION

<!-- snippet
id: python_logging_basic
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,logging
title: Logging en Python
content: logging permet d'enregistrer les événements d'une application
description: Base observabilité
-->

<!-- snippet
id: python_logging_levels
type: concept
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,logging
title: Niveaux de logs
content: DEBUG INFO WARNING ERROR CRITICAL permettent de classifier les logs
description: Permet filtrage
-->

<!-- snippet
id: python_print_warning
type: warning
tech: python
level: intermediate
importance: high
format: knowledge
tags: python,logging,error
title: print en production
content: print non structuré → inutilisable → utiliser logging
description: erreur classique
-->

