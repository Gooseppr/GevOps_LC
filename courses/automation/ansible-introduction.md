---
layout: page
title: "Ansible — Introduction et concepts fondamentaux"
course: automation
chapter_title: Orchestration
chapter: 1
section: 1
tags: ansible, yaml, ssh, automation, idempotence
difficulty: beginner
duration: 60
mermaid: true
---

# Ansible — Introduction

> **Cours thématique** · Orchestration · Chapitre 1 / Section 1

---

## Pourquoi Ansible ?

Ansible permet d'automatiser la configuration de serveurs, le déploiement d'applications et l'orchestration de tâches complexes — sans agent à installer sur les machines cibles.

```mermaid
graph LR
    A[Machine de contrôle<br/>Ansible] -->|SSH| B[Serveur 1]
    A -->|SSH| C[Serveur 2]
    A -->|SSH| D[Serveur 3]
    style A fill:#0f172a,color:#4ade80
```

## Concepts clés

| Concept | Rôle |
|---|---|
| **Inventory** | Liste des machines cibles |
| **Playbook** | Fichier YAML décrivant les tâches |
| **Task** | Action unitaire (install, copy, service…) |
| **Module** | Brique fonctionnelle d'Ansible |
| **Role** | Structure réutilisable de tâches |

---

## Prochaine section

- [Ansible — Premier playbook](ansible-premier-playbook)
