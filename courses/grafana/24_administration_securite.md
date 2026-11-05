---
layout: page
title: "Administration, sécurité et permissions"

course: grafana
chapter_title: "Intermédiaire"

chapter: 2
section: 12

tags: grafana,securite,rbac,authentification,hardening
difficulty: intermediate
duration: 90
mermaid: true

status: "published"
prev_module: "/courses/grafana/23_observabilite_kubernetes.html"
prev_module_title: "Observabilité des conteneurs et Kubernetes"
next_module: "/courses/grafana/25_provisioning_api.html"
next_module_title: "Provisioning, API et versionnement"
---

# Administration, sécurité et permissions

## Objectifs pédagogiques

À la fin de ce module, vous saurez :

- **Structurer** une instance Grafana avec organisations, équipes et dossiers, et expliquer ce que chacun de ces niveaux isole réellement.
- **Démontrer** qu'un utilisateur limité par les permissions de dossier peut quand même interroger la Data Source, puis **choisir** la parade adaptée (organisation, Data Source par tenant, proxy, Enterprise).
- **Configurer** l'authentification locale et OAuth avec un mapping de rôles qui refuse par défaut.
- **Durcir** `grafana.ini`, le reverse proxy et le stockage des secrets de Data Sources.
- **Tester** depuis l'extérieur que le durcissement est effectif, et **détecter** les tentatives d'abus dans les logs.

## Mise en situation : décembre 2021, un fichier lu sans authentification

En décembre 2021, Grafana publie des correctifs pour **CVE-2021-43798**. Le défaut touche les versions 8.0.0-beta1 à 8.3.0 et affecte une route qui sert les fichiers statiques des plugins : un chemin avec des `../` permet de sortir du répertoire du plugin. Aucun compte n'est nécessaire. Des scanners comme `nuclei` ont aussitôt embarqué un template de détection, et des instances exposées sur Internet ont été balayées en masse.

> 🔴 **Vecteur d'attaque** : l'attaquant ne se contente pas de `/etc/passwd`. Il cible deux fichiers.
{: .callout .callout-danger}

```bash
# Test non destructif sur votre propre instance (--path-as-is empêche curl de normaliser les ../)
curl --path-as-is -s "http://<HOST>:3000/public/plugins/alertlist/../../../../../../../../var/lib/grafana/grafana.db" -o grafana.db
curl --path-as-is -s "http://<HOST>:3000/public/plugins/alertlist/../../../../../../../../etc/grafana/grafana.ini"
```

Pourquoi ces deux fichiers ?

- `grafana.db` est la base SQLite : elle contient les utilisateurs, les hashes de mots de passe et la table `data_source`, dont les champs sensibles sont chiffrés.
- `grafana.ini` contient la `secret_key` qui sert à les chiffrer.

Si cette clé est restée à sa valeur historique par défaut, ou si elle est lisible par le même vecteur, l'attaquant déchiffre hors ligne les mots de passe et tokens de toutes les Data Sources. Il se retrouve alors avec des accès directs à Prometheus, Loki, aux bases SQL et aux API cloud, sans repasser par Grafana.

Pourquoi la défense naïve ne suffit pas :

- Les **permissions de dossier** n'y changent rien : la lecture de fichier a lieu avant toute authentification.
- **Patcher** ferme la porte mais ne révoque rien. Si le fichier a été lu avant le patch, les secrets doivent être considérés comme compromis et rotés côté backend.
- Un Grafana « interne » derrière un VPN reste atteignable par n'importe quel poste compromis de ce VPN.

Ce module construit la défense dans l'ordre inverse de l'attaque : réduire ce qui est exposé, limiter ce qu'un compte peut faire, puis rendre les secrets volés inutilisables.

## Surface d'attaque d'une instance Grafana

| Vecteur | Exposition | Impact potentiel |
|---|---|---|
| Port 3000 exposé directement | HTTP en clair, pas d'en-têtes de sécurité, accès direct contournant le proxy | Vol de session, bypass de l'auth proxy |
| Compte `admin` / `admin` | Valeur par défaut au premier démarrage, jamais changée | Contrôle total : Data Sources, plugins, utilisateurs |
| Accès anonyme activé | `[auth.anonymous] enabled = true` copié depuis un tuto | Lecture (ou édition) sans compte, et requêtes vers les backends |
| `/metrics` ouvert | Endpoint Prometheus de Grafana, sans auth par défaut | Reconnaissance : version, volumétrie, noms de handlers |
| Data Sources | Proxy sortant de Grafana vers vos backends | SSRF*, accès à `169.254.169.254`, exfiltration via des Data Sources malveillantes |
| `/api/ds/query` | API utilisée par les panels, appelable directement | Lecture de toutes les données d'une Data Source par un simple Viewer |
| Tokens de service account | Souvent créés en Admin, sans expiration, collés dans un CI | Persistance silencieuse après le départ de la personne |
| Plugins | Code exécuté côté serveur (backend) ou navigateur | Exécution de code, vol de credentials, chaîne d'approvisionnement |
| `grafana.db` et `grafana.ini` | Fichiers du volume `/var/lib/grafana` et `/etc/grafana` | Déchiffrement des secrets de Data Sources |

\* SSRF (Server-Side Request Forgery) : le serveur est poussé à émettre une requête vers une cible interne choisie par l'attaquant.

## Organisations, utilisateurs, équipes et dossiers ⭐

> 🧠 **Concept clé** : ces quatre niveaux ne protègent pas contre la même chose. La majorité des incidents d'accès Grafana viennent de la confusion entre « masquer dans l'interface » et « isoler dans le backend ».
{: .callout .callout-important}

```mermaid
flowchart TD
    A[Utilisateur] --> B[Reverse proxy TLS]
    B --> C[Authentification Grafana]
    C --> D[Organisation]
    D --> E[Rôle de base Viewer Editor Admin]
    E --> F[Permissions de dossier]
    F --> G[Dashboards et alertes]
    E --> H[Data Source]
    H --> I[Backend Prometheus Loki SQL]
```

Dans ce schéma, le chemin « dossier → dashboard » est le seul contrôlé par les permissions de dossier. Le chemin « rôle de base → Data Source → backend » reste ouvert dès que le rôle autorise la requête.

| Niveau | Ce qu'il isole | Ce qu'il n'isole pas |
|---|---|---|
| Server Admin | Droit global sur l'instance (utilisateurs, orgs, paramètres) | N'est pas un rôle d'organisation : à réserver à 2 ou 3 personnes |
| Organisation | Dashboards, Data Sources, dossiers, service accounts, alertes séparés | Partage la même base, le même processus et les mêmes plugins |
| Équipe | Regroupement pour attribuer des permissions | Aucune frontière : c'est une étiquette sur des permissions |
| Dossier | Visibilité et droits d'édition des dashboards et règles d'alerte du dossier | Les Data Sources, qui sont au niveau de l'organisation |

Les rôles de base d'une organisation sont `Admin`, `Editor`, `Viewer` et `None` (aucun droit de base, permissions accordées uniquement par dossier ou rôle fixe). Un Server Admin a accès à toutes les organisations ; il n'y a pas de notion de « super-lecture seule ».

### RBAC et capacités selon l'édition

> 📖 **Définition.** RBAC (Role-Based Access Control) est le mécanisme de Grafana qui décompose les droits en permissions fines (`dashboards:write`, `datasources:query`, `alert.rules:read`…) regroupées en rôles.
{: .callout .callout-definition}

Ce qui est disponible dépend de l'édition. Vérifiez dans la documentation de votre version, car cette répartition évolue.

| Capacité | OSS | Enterprise / Cloud |
|---|---|---|
| Rôles de base Admin / Editor / Viewer / None | Oui | Oui |
| Permissions de dossier et de dashboard (utilisateur, équipe, rôle) | Oui | Oui |
| Service accounts avec tokens | Oui | Oui |
| Rôles personnalisés et attribution de rôles fixes | Non | Oui |
| Permissions par Data Source | Non | Oui |
| Synchronisation des groupes IdP vers les équipes (team sync) | Non | Oui |
| LBAC (Label-Based Access Control) sur certaines Data Sources | Non | Oui, selon backend et version |
| Journaux d'audit natifs | Non | Oui |

Le coût d'Enterprise est réel, mais le coût inverse l'est aussi : sans permissions par Data Source en OSS, vous compensez par plus d'organisations, plus de Data Sources provisionnées et plus de gouvernance de configuration.

### ⚠️ Les permissions de dashboard ne garantissent pas l'isolation des données

Un Viewer limité au dossier `Team-A` ne peut pas ouvrir les dashboards de `Team-B`. Mais en OSS, il garde le droit d'interroger les Data Sources de l'organisation. L'UI n'est qu'un client de l'API : masquer Explore n'est donc pas une protection.

> 🚪 **Analogie : effacer une porte du plan.** Masquer un dashboard ou Explore revient à retirer une porte du plan de l'immeuble sans la verrouiller : qui sait où elle se trouve entre quand même. Seul un verrou côté backend ou une organisation séparée ferme réellement l'accès.
{: .callout .callout-analogie}

> 🔴 **Vecteur d'attaque** : un compte Viewer appelle directement `/api/ds/query`. L'`uid` de la Data Source apparaît dans le JSON de n'importe quel dashboard lisible.
{: .callout .callout-danger}

```bash
curl -s -u <VIEWER>:<PASSWORD> -H 'Content-Type: application/json' \
  "https://<GRAFANA_FQDN>/api/ds/query" \
  -d '{"queries":[{"refId":"A","datasource":{"uid":"<DS_UID>"},"expr":"up{namespace=\"team-b-prod\"}","instant":true}],"from":"now-5m","to":"now"}'
```

Si la réponse contient des séries du namespace `team-b-prod`, la frontière n'existe qu'au niveau de l'interface.

> 🔒 **Contrôle de sécurité** : le bon choix dépend du niveau d'isolation exigé.
{: .callout .callout-securite}

| Besoin | Mise en œuvre | Compromis |
|---|---|---|
| Séparer deux équipes qui ne se font pas confiance | Une organisation par tenant, chacune avec ses Data Sources | Pas de dashboards transverses, provisioning à répéter |
| Garder une seule organisation | Data Sources dédiées par tenant, avec credentials côté backend limités à ce tenant | Multiplication des Data Sources, il faut un backend qui sache cloisonner |
| Cloisonner un Prometheus partagé | Proxy qui impose le label du tenant devant Prometheus (type `prom-label-proxy`) | Un composant de plus à exploiter, latence ajoutée |
| Restreindre par Data Source ou par label | Permissions de Data Source ou LBAC (Enterprise/Cloud) | Licence, comportement dépendant de la version |
| Frontière dure (réglementaire, clients distincts) | Instances Grafana séparées | Coût d'exploitation, mises à jour à répéter |

Exemple pour Loki en multi-tenant : une Data Source par équipe, avec l'en-tête de tenant injecté par Grafana.

```yaml
apiVersion: 1
datasources:
  - name: loki-team-a
    uid: loki-team-a
    type: loki
    access: proxy
    url: https://<LOKI_GATEWAY>
    jsonData:
      httpHeaderName1: X-Scope-OrgID
    secureJsonData:
      httpHeaderValue1: team-a
```

> ⚠️ **Erreur fréquente** : `X-Scope-OrgID` est une convention d'adressage, pas une authentification. Si Loki est joignable directement depuis le réseau des utilisateurs, n'importe qui peut choisir un autre tenant. Il faut une passerelle qui authentifie et fixe l'en-tête, ou une isolation réseau stricte, ce qui fait entrer le pare-feu dans le périmètre de sécurité des données.
{: .callout .callout-attention}

## Authentification : local, OAuth et SSO

**Authentification locale.** Utile pour le premier démarrage et pour un compte de secours. Elle repose sur des mots de passe stockés dans `grafana.db`, avec une protection contre la force brute activée par défaut (verrouillage temporaire après plusieurs échecs). Elle n'offre ni MFA ni révocation centralisée.

**SSO (Single Sign-On) via OAuth ou OpenID Connect.** Grafana délègue l'authentification à un fournisseur d'identité (IdP, Identity Provider) et lui demande l'identité plus des attributs (email, groupes).

- Variantes courantes : GitHub, GitLab, Google, Azure AD/Entra ID, Okta, Generic OAuth.
- SAML (Security Assertion Markup Language) est réservé à Enterprise/Cloud.
- LDAP (Lightweight Directory Access Protocol) reste disponible en OSS.

> 💡 **À retenir** : le SSO n'est rentable que si le mapping de rôles est correctement fait. Un SSO sans mapping donne à tout le monde le rôle par défaut.
{: .callout .callout-important}

Configuration avec refus par défaut :

```ini
[auth.generic_oauth]
enabled = true
name = <IDP_NAME>
client_id = <CLIENT_ID>
client_secret = $__file{/run/secrets/oauth_client_secret}
scopes = openid email profile groups
auth_url = https://<IDP_HOST>/authorize
token_url = https://<IDP_HOST>/token
api_url = https://<IDP_HOST>/userinfo
use_pkce = true
allow_sign_up = true
role_attribute_path = contains(groups[*], 'grafana-admins') && 'Admin' || contains(groups[*], 'grafana-editors') && 'Editor' || contains(groups[*], 'grafana-viewers') && 'Viewer'
role_attribute_strict = true
allow_assign_grafana_admin = false
```

Points à comprendre :

- `role_attribute_path` est une expression JMESPath évaluée sur le token ou la réponse userinfo. Sans valeur finale par défaut et avec `role_attribute_strict = true`, un utilisateur hors des trois groupes est **refusé** au login. Sans `strict`, il hériterait de `auto_assign_org_role`.
- `allow_sign_up` dans `[auth.generic_oauth]` ne veut pas dire « inscription publique » : il autorise la création automatique du compte au premier login SSO. Le même nom dans `[users]` désigne l'inscription locale, qui doit rester à `false`.
- PKCE (Proof Key for Code Exchange)\* protège l'échange de code contre l'interception.
- `allow_assign_grafana_admin = false` empêche l'IdP de promouvoir quiconque Server Admin.
- La liaison d'un compte SSO à un compte local se fait normalement sur un identifiant stable. Les vulnérabilités de prise de contrôle de compte via l'email, comme **CVE-2023-3128** côté Azure AD, ont montré que lier sur un champ modifiable par l'utilisateur est dangereux. Gardez Grafana à jour et ne mettez pas `oauth_allow_insecure_email_lookup` à `true` sans comprendre pourquoi.

\* PKCE : le client génère un secret éphémère haché envoyé à l'autorisation puis révélé à l'échange ; un code volé ne sert à rien sans ce secret.

Compte de secours : gardez un compte local administrateur au mot de passe fort et stocké hors ligne. Après activation du SSO, vous pouvez masquer le formulaire avec `[auth] disable_login_form = true`. Pour reprendre la main en cas d'IdP indisponible, il faut un accès shell : `grafana cli admin reset-admin-password <PASSWORD>`.

> ⚠️ **Auth proxy** (`[auth.proxy]`) : Grafana fait confiance à un en-tête (ex. `X-WEBAUTH-USER`) posé par le proxy. Si Grafana est joignable sans passer par le proxy, un simple `curl -H 'X-WEBAUTH-USER: admin'` suffit. N'activez ce mode que si Grafana n'écoute que sur le réseau du proxy et définissez `whitelist` avec ses adresses.
{: .callout .callout-attention}

## Configuration sécurisée

Avant, typique d'un déploiement « ça marche » :

```ini
[security]
admin_user = admin
admin_password = admin

[users]
allow_sign_up = true

[auth.anonymous]
enabled = true
org_role = Editor
```

Après :

```ini
[server]
protocol = http
http_addr = 127.0.0.1
root_url = https://<GRAFANA_FQDN>/
enforce_domain = true

[security]
admin_user = <ADMIN_USER>
admin_password = $__file{/run/secrets/grafana_admin_password}
secret_key = $__file{/run/secrets/grafana_secret_key}
disable_initial_admin_creation = false
cookie_secure = true
cookie_samesite = lax
allow_embedding = false
content_security_policy = true
data_source_proxy_whitelist = <PROM_HOST>:9090 <LOKI_HOST>:3100
disable_gravatar = true

[users]
allow_sign_up = false
allow_org_create = false
auto_assign_org_role = Viewer
viewers_can_edit = false

[auth]
login_maximum_inactive_lifetime_duration = 7d
login_maximum_lifetime_duration = 30d

[auth.anonymous]
enabled = false

[metrics]
enabled = true
basic_auth_username = <METRICS_USER>
basic_auth_password = $__file{/run/secrets/grafana_metrics_password}

[plugins]
plugin_admin_enabled = false
allow_loading_unsigned_plugins =

[analytics]
reporting_enabled = false
check_for_updates = false
check_for_plugin_updates = false
```

Ce que ça coûte et ce que ça impose :

- `http_addr = 127.0.0.1` suppose un reverse proxy local ou un sidecar. En conteneur, utilisez plutôt un réseau Docker interne et ne publiez pas le port.
- `data_source_proxy_whitelist` limite les destinations joignables via le proxy de Data Source (`/api/datasources/proxy`). Selon la version, les requêtes qui passent par les backends de plugins (`/api/ds/query`) peuvent ne pas être concernées : complétez par un filtrage réseau sortant, notamment vers l'API de métadonnées cloud. Chaque nouvelle Data Source impose de modifier la liste.
- `plugin_admin_enabled = false` retire l'installation de plugins depuis l'UI. Les plugins passent par l'image ou le provisioning, donc par une revue.
- Les durées de session imposent une reconnexion régulière. Sur des postes de salle de supervision en affichage permanent, utilisez un compte Viewer dédié à durée plus longue plutôt que d'allonger la valeur globale.
- `$__file{...}` lit le secret depuis un fichier monté (Docker secrets, Kubernetes Secret). En variables d'environnement, le suffixe `__FILE` fait la même chose : `GF_SECURITY_ADMIN_PASSWORD__FILE=/run/secrets/grafana_admin_password`.
- Les paramètres dépendent de la version : vérifiez `defaults.ini` de la version déployée.

> 💡 **Astuce** : changez le mot de passe admin dès le premier démarrage, avant de publier quoi que ce soit. Après coup, `grafana cli admin reset-admin-password` marche aussi, mais ne répare pas le fait que la fenêtre d'exposition ait existé.
{: .callout .callout-astuce}

## Secrets et credentials de Data Sources

Grafana stocke les credentials de Data Sources dans `secure_json_data`, chiffrés avec une clé dérivée de `secret_key`. L'API ne les renvoie jamais en clair : elle expose seulement `secureJsonFields: {"basicAuthPassword": true}`. Cela protège contre la lecture par un compte, mais pas contre la fuite de `grafana.db` combinée à celle de `secret_key`, comme dans le scénario d'ouverture.

Provisioning correct, avec secrets injectés depuis l'environnement :

```yaml
apiVersion: 1
datasources:
  - name: prometheus-prod
    uid: prometheus-prod
    type: prometheus
    access: proxy
    url: https://<PROM_HOST>:9090
    basicAuth: true
    basicAuthUser: <PROM_USER>
    jsonData:
      tlsAuthWithCACert: true
    secureJsonData:
      basicAuthPassword: $PROM_PASSWORD
      tlsCACert: $__file{/run/secrets/prom_ca.pem}
```

Règles de gestion :

- Les secrets vivent dans un secrets manager (Vault, Kubernetes Secret avec chiffrement au repos, gestionnaire du cloud) et arrivent à Grafana par fichier ou variable d'environnement. Ils ne sont jamais committés dans le dépôt de provisioning.
- Définissez explicitement `secret_key` à une valeur aléatoire propre à l'instance. Le changer plus tard exige de ré-chiffrer les secrets existants avec `grafana cli admin secrets-migration` (sous-commandes variables selon la version) : planifiez cette opération avant la mise en production, pas après.
- Selon la version et l'édition, le chiffrement par enveloppe avec un KMS externe est possible. Il évite que la compromission du volume suffise.
- Chaque Data Source utilise un compte backend en **lecture seule** avec le périmètre minimal. Pour une base SQL, un rôle `SELECT` sur les schémas utiles, pas le compte applicatif.
- Jamais d'identifiants dans l'URL (`https://user:pass@host`), ni de token dans une query string : l'URL apparaît dans les logs du proxy et dans le JSON de Data Source lisible par les éditeurs.

> ⚠️ **Erreur fréquente** : un token API collé dans un panel Text ou un champ « custom header » de l'UI plutôt que dans `secureJsonData`. Il devient lisible dans l'export JSON du dashboard et indexé par tout outil de sauvegarde. Correction : en-têtes sensibles via `httpHeaderName1` + `secureJsonData.httpHeaderValue1`.
{: .callout .callout-attention}

Après un incident, la rotation se fait côté **backend** : changez le mot de passe de chaque compte stocké dans Grafana, puis mettez à jour la Data Source. Régénérer `secret_key` ne protège pas des secrets déjà déchiffrés par l'attaquant.

## TLS, reverse proxy et exposition réseau

Terminer TLS (Transport Layer Security) sur un reverse proxy permet de centraliser les certificats, les en-têtes et le filtrage. Grafana n'écoute alors qu'en local ou sur un réseau interne.

```nginx
server {
    listen 443 ssl http2;
    server_name <GRAFANA_FQDN>;

    ssl_certificate     /etc/ssl/<GRAFANA_FQDN>.crt;
    ssl_certificate_key /etc/ssl/<GRAFANA_FQDN>.key;
    ssl_protocols       TLSv1.2 TLSv1.3;

    add_header Strict-Transport-Security "max-age=31536000" always;

    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:3000;
    }

    # Grafana Live utilise des WebSockets
    location /api/live/ {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_pass http://127.0.0.1:3000;
    }

    # Pas de /metrics côté public
    location = /metrics { return 404; }
}
```

À vérifier, parce que ça casse silencieusement :

- `root_url` doit correspondre à l'URL publique, sinon les redirections OAuth et les liens d'alerte pointent au mauvais endroit.
- Sans le bloc WebSocket, Grafana Live ne fonctionne pas et l'erreur se voit dans la console du navigateur, pas dans les logs serveur.
- `proxy_set_header Host` doit conserver le nom public : avec `enforce_domain`, une valeur incorrecte provoque des redirections en boucle.
- TLS entre Grafana et ses Data Sources est un sujet distinct : `tlsSkipVerify: false` et une CA fournie, sinon le chiffrement protège contre l'écoute passive mais pas contre un homme du milieu.
- Pour la production, filtrez en plus par source (VPN, réseau d'administration) via le proxy ou le pare-feu. Une instance Internet-facing avec SSO est acceptable, mais ce n'est pas la même gouvernance de patchs : les correctifs critiques doivent s'appliquer en quelques jours, pas au prochain trimestre.

## Plugins, mises à jour et audit

Les plugins backend s'exécutent dans des processus séparés lancés par Grafana, qui communiquent avec lui en gRPC. Ils tournent toutefois avec le même utilisateur système et les mêmes accès réseau. Un plugin malveillant ou compromis peut donc lire `grafana.db` et les secrets montés.

```bash
grafana cli plugins ls
grafana cli plugins update-all
```

Les commandes sont `grafana-cli` sur les anciennes versions.

- En conteneur, évitez `update-all` en production : reconstruisez l'image avec les plugins versionnés (variable de préinstallation de l'image officielle, dont le nom dépend de la version : `GF_INSTALL_PLUGINS`, déprécié au profit de `GF_PLUGINS_PREINSTALL` ; ou Dockerfile), scannez-la, puis déployez.
- Les plugins non signés (`allow_loading_unsigned_plugins`) sont réservés au développement. En production, chaque exception doit être listée par identifiant, jamais jokerisée.

Pour les mises à jour :

- Suivez les annonces de sécurité Grafana et visez les branches de patch (`X.Y.Z`) rapidement ; une montée de version majeure demande des tests (changements d'alerting, de dashboards, de plugins).
- Épinglez la version d'image (`grafana/grafana:<VERSION>`), jamais `latest` en production. Le rollback en dépend.
- Scannez l'image avant déploiement : `trivy image grafana/grafana:<VERSION>`.

Audit des comptes et des jetons (à planifier tous les trimestres, ou après un départ) :

```bash
# Server Admins
curl -s -u <ADMIN>:<PASSWORD> "https://<GRAFANA_FQDN>/api/users?perpage=1000" \
  | jq -r '.[] | select(.isAdmin==true) | .login'

# Service accounts : rôle et nombre de tokens
curl -s -u <ADMIN>:<PASSWORD> "https://<GRAFANA_FQDN>/api/serviceaccounts/search?perpage=100" \
  | jq '.serviceAccounts[] | {name, role, tokens}'
```

Un service account avec le rôle `Admin` et des tokens sans expiration est une porte dérobée en attente. Créez les tokens avec une durée de vie explicite (`secondsToLive` dans l'appel `POST /api/serviceaccounts/<ID>/tokens`) et limitez le rôle au strict nécessaire (souvent `Viewer` ou `Editor`).

## Contrôles de détection

Sans Enterprise, il n'y a pas de journal d'audit natif : la détection repose sur les logs d'accès de Grafana, ceux du proxy et l'état des comptes.

Activez la journalisation des requêtes avec `[server] router_logging = true` (volumineux : filtrez en amont). Si Grafana envoie ses logs vers Loki, voici les requêtes utiles :

```logql
# Échecs de login par IP source (format de log variable selon version)
sum by (remote_addr) (
  count_over_time({app="grafana"} |= "Invalid username or password" | logfmt [10m])
)

# Tentatives de path traversal sur les plugins
{app="nginx"} |~ "/public/plugins/[^ ]*(\\.\\./|%2e%2e)"

# Appels directs à l'API de requête par des comptes inattendus
sum by (uname) (
  count_over_time({app="grafana"} |= "/api/ds/query" | logfmt | status=200 [1h])
)
```

Indicateurs de compromission à surveiller :

- Pic d'échecs de login sur `admin`, ou succès après une série d'échecs depuis la même IP.
- Création d'un service account ou d'un token en dehors d'une fenêtre de changement.
- Changement d'URL ou d'en-têtes d'une Data Source existante (par comparaison avec le provisioning versionné).
- Installation d'un plugin non listé dans l'image.
- Requêtes `/api/ds/query` volumineuses ou répétitives par un compte Viewer.

Une alerte « plus aucun log Grafana depuis 10 minutes » est aussi un contrôle de sécurité : un attaquant qui coupe la journalisation ne doit pas passer inaperçu. C'est un sujet de meta-monitoring traité plus loin dans le parcours.

## Tests de sécurité

Testez depuis l'extérieur, avec un poste qui ressemble à celui d'un attaquant, et pas seulement depuis le serveur.

```bash
# 1. Accès anonyme : doit renvoyer 401
curl -s -o /dev/null -w '%{http_code}\n' https://<GRAFANA_FQDN>/api/search

# 2. Credentials par défaut : doit renvoyer 401
curl -s -o /dev/null -w '%{http_code}\n' -u admin:admin https://<GRAFANA_FQDN>/api/org

# 3. Path traversal plugin : ne doit PAS renvoyer 200
#    Via nginx, un 400 peut venir du proxy (normalisation de l'URI) et ne prouve pas que Grafana est corrigé :
#    rejouez le test sur http://<HOST>:3000 depuis le réseau interne
curl --path-as-is -s -o /dev/null -w '%{http_code}\n' \
  "https://<GRAFANA_FQDN>/public/plugins/alertlist/../../../../../../../../etc/passwd"

# 4. En-têtes de sécurité
curl -sI https://<GRAFANA_FQDN>/login | grep -iE 'strict-transport|content-security|x-frame|set-cookie'

# 5. /metrics ne doit pas être public
curl -s -o /dev/null -w '%{http_code}\n' https://<GRAFANA_FQDN>/metrics

# 6. Port 3000 non joignable depuis l'extérieur
nmap -Pn -p 3000 <GRAFANA_FQDN>

# 7. Protocoles TLS acceptés
openssl s_client -connect <GRAFANA_FQDN>:443 -tls1_1 </dev/null 2>&1 | grep -i 'handshake failure\|alert'

# 8. Détection de vulnérabilités connues
nuclei -u https://<GRAFANA_FQDN> -tags grafana

# 9. Image conteneur
trivy image grafana/grafana:<VERSION>
```

Test d'isolation à faire à chaque évolution de permissions : créez un compte `Viewer` limité à un dossier, puis relancez la requête `/api/ds/query` de la section précédente avec une expression hors de son périmètre. Le résultat doit correspondre à votre modèle d'isolation, pas à votre intention.

## Cas réel en entreprise (scénario illustratif)

Une plateforme SaaS regroupe trois équipes produit sur un seul Grafana OSS. Chaque équipe a son dossier, ses dashboards et son équipe Grafana. Tout le monde a le rôle `Viewer`, avec droits d'édition par dossier. Les logs passent par une unique Data Source Loki.

Lors d'un audit interne, un développeur de l'équipe B démontre qu'avec un appel direct à `/api/ds/query`, il lit les logs applicatifs de l'équipe A. Ces logs contiennent des adresses email de clients et, ponctuellement, des identifiants de session. Les chiffres de l'exemple (3 équipes, 40 comptes, 2 mois de logs exposés) sont illustratifs.

Actions, dans l'ordre :

1. **Contenir** : retirer l'accès Viewer large et activer le SSO avec mapping strict pour réduire le nombre de comptes. Désactiver Explore en attendant ne protège pas : le blocage doit se faire au niveau Loki.
2. **Corriger la source** : passer Loki en multi-tenant (`X-Scope-OrgID`) derrière une passerelle qui authentifie. Une Data Source par équipe, provisionnée avec l'en-tête du tenant. Vérifier que Loki n'est plus joignable que depuis la passerelle.
3. **Séparer** : une organisation Grafana par équipe, ce qui supprime aussi les risques de collision de noms de dashboards et d'alertes.
4. **Nettoyer** : masquer les emails dans les logs à la source (pipeline de collecte), et invalider les sessions loguées.
5. **Vérifier** : un compte de test par équipe rejoue la requête directe contre les autres tenants et doit obtenir un résultat vide ou un refus.

> 💡 **À retenir** : la discussion « qui voit quel dashboard » a masqué la vraie question, « qui peut lire quelle donnée ».
{: .callout .callout-important}

Le coût final a été le multiplicateur de Data Sources et d'organisations, bien inférieur à celui d'un incident de données clients.

## Erreurs fréquentes

⚠️ **Accès anonyme avec rôle trop large**

- Configuration dangereuse : `[auth.anonymous] enabled = true` avec `org_role = Editor`, laissé après une démo.
- Conséquence : toute personne atteignant l'URL édite des dashboards et interroge les Data Sources sans compte.
- Correction : `enabled = false`. Pour un écran public, un Viewer avec dashboard publié et Data Source dédiée en lecture limitée. Détection : `curl -s -o /dev/null -w '%{http_code}' https://<HOST>/api/search` doit renvoyer 401.

⚠️ **Token Admin éternel dans le CI**

- Configuration dangereuse : un service account `Admin` dont le token n'expire jamais, copié dans un pipeline.
- Conséquence : quiconque lit les variables du CI (ou leurs logs) contrôle la plateforme, même après le départ de l'auteur.
- Correction : un service account par usage avec le rôle minimal, token à durée de vie courte, rotation dans le secrets manager. Détection : l'audit `/api/serviceaccounts/search` ci-dessus.

⚠️ **Grafana exposé directement, avec auth proxy**

- Configuration dangereuse : `[auth.proxy] enabled = true` et port 3000 publié.
- Conséquence : l'attaquant envoie lui-même l'en-tête d'identité et devient n'importe quel utilisateur.
- Correction : `http_addr = 127.0.0.1`, `whitelist` des IP du proxy, réseau interne. Détection : `nmap -Pn -p 3000 <HOST>` doit montrer le port filtré.

⚠️ **`/metrics` ouvert**

- Configuration dangereuse : endpoint Prometheus de Grafana sans authentification derrière un proxy qui laisse tout passer.
- Conséquence : version exacte, nombre d'utilisateurs, handlers : reconnaissance facile.
- Correction : `[metrics] basic_auth_username/password`, plus blocage au proxy, et scrape depuis le réseau interne uniquement.

⚠️ **Plugin non signé « juste pour tester »**

- Configuration dangereuse : `allow_loading_unsigned_plugins = *` dans l'environnement de production.
- Conséquence : tout code déposé dans le répertoire de plugins s'exécute avec les droits de Grafana.
- Correction : liste explicite d'identifiants, plugins intégrés à l'image et scannés. Détection : `grafana cli plugins ls` comparé à la liste attendue.

⚠️ **Data Source avec compte privilégié**

- Configuration dangereuse : Prometheus, SQL ou API cloud configurés avec un compte d'écriture ou d'administration.
- Conséquence : toute fuite de secret ou tout accès Editor à la Data Source devient un accès en écriture au backend.
- Correction : compte dédié lecture seule, périmètre minimal, `data_source_proxy_whitelist` pour restreindre les destinations.

## Résumé

Grafana expose trois surfaces : le réseau (port, proxy, `/metrics`), l'identité (comptes locaux, SSO, tokens) et les Data Sources (secrets stockés, requêtes autorisées). Les permissions de dossier et de dashboard contrôlent la visibilité des objets Grafana, mais pas la lecture des backends : un Viewer peut interroger directement `/api/ds/query`. L'isolation réelle passe par les organisations, des Data Sources par tenant avec des credentials limités côté backend, ou les permissions de Data Source (Enterprise/Cloud). Le durcissement combine `grafana.ini` strict, SSO avec rôle refusé par défaut, secrets montés par fichier, TLS au proxy et plugins figés dans l'image. À surveiller ensuite : les échecs de login, les appels directs à l'API de requête, les tokens sans expiration et les écarts entre la configuration réelle et le provisioning versionné.

<!-- snippet
id: grafana_security_viewer_ds_query_test
type: command
tech: grafana
level: intermediate
importance: high
format: knowledge
tags: grafana,isolation,datasource,api
title: Tester l'isolation des données avec un compte Viewer
context: À exécuter avec un compte Viewer restreint à un dossier, sur la Data Source dont vous voulez vérifier le cloisonnement
command: curl -s -u <VIEWER>:<PASSWORD> -H 'Content-Type: application/json' "https://<GRAFANA_FQDN>/api/ds/query" -d '{"queries":[{"refId":"A","datasource":{"uid":"<DS_UID>"},"expr":"<PROMQL>","instant":true}],"from":"now-5m","to":"now"}'
example: curl -s -u alice:Pa55 -H 'Content-Type: application/json' "https://grafana.example.com/api/ds/query" -d '{"queries":[{"refId":"A","datasource":{"uid":"prometheus-prod"},"expr":"up{namespace=\"team-b-prod\"}","instant":true}],"from":"now-5m","to":"now"}'
description: Si des séries hors périmètre reviennent, les permissions de dossier ne protègent que l'interface, pas la donnée du backend.
-->

<!-- snippet
id: grafana_security_dashboard_perms_not_isolation
type: warning
tech: grafana
level: intermediate
importance: high
format: knowledge
tags: grafana,rbac,isolation,datasource
title: Permissions de dossier ≠ isolation des données
content: Un Viewer limité au dossier Team-A ne voit pas les dashboards Team-B, mais en OSS il peut appeler /api/ds/query sur toute Data Source de l'organisation, avec l'uid lu dans n'importe quel dashboard accessible. Correction : une organisation ou une Data Source par tenant avec credentials backend limités à ce tenant, ou permissions de Data Source/LBAC en Enterprise ou Cloud.
description: Masquer Explore ou des dashboards n'empêche pas l'appel direct à l'API : la frontière doit exister dans le backend ou dans l'organisation.
-->

<!-- snippet
id: grafana_security_org_team_folder_boundaries
type: concept
tech: grafana
level: intermediate
importance: high
format: knowledge
tags: grafana,organisations,equipes,dossiers
title: Ce qu'isole une organisation, une équipe, un dossier
content: Organisation = Data Sources, dashboards, dossiers et service accounts séparés dans la même base. Équipe = simple regroupement pour attribuer des permissions, aucune frontière. Dossier = visibilité des dashboards et règles d'alerte, mais les Data Sources restent au niveau de l'organisation. Seule l'organisation sépare vraiment les Data Sources en OSS.
description: Choisir le niveau selon la menace : le dossier masque des objets, l'organisation sépare les Data Sources, l'instance séparée isole tout.
-->

<!-- snippet
id: grafana_security_cve_2021_43798_path_traversal_test
type: command
tech: grafana
level: intermediate
importance: high
format: knowledge
tags: grafana,cve,path-traversal,plugins
title: Tester CVE-2021-43798 sur sa propre instance
context: Concerne Grafana 8.0.0-beta1 à 8.3.0 ; à lancer uniquement sur vos propres instances
command: curl --path-as-is -s -o /dev/null -w '%{http_code}\n' "http://<HOST>:3000/public/plugins/alertlist/../../../../../../../../etc/passwd"
example: curl --path-as-is -s -o /dev/null -w '%{http_code}\n' "http://grafana.internal:3000/public/plugins/alertlist/../../../../../../../../etc/passwd"
description: Un 200 avec contenu indique une version vulnérable ; --path-as-is empêche curl de normaliser les ../ avant l'envoi.
-->

<!-- snippet
id: grafana_security_secret_key_exfiltration
type: warning
tech: grafana
level: advanced
importance: high
format: knowledge
tags: grafana,secrets,secret-key,datasource
title: grafana.db et secret_key lus = secrets de Data Sources perdus
content: Les credentials de Data Sources sont chiffrés avec une clé dérivée de secret_key. Si grafana.db et secret_key sont lus (volume monté trop largement, lecture de fichier type CVE-2021-43798, secret_key par défaut), l'attaquant déchiffre tout hors ligne. Correction : secret_key aléatoire et monté en secret, et rotation des mots de passe côté backend après tout incident, car changer secret_key ne révoque rien.
description: Le chiffrement ne protège que si la clé et la base ne fuitent pas ensemble ; la rotation doit se faire sur les backends, pas dans Grafana.
-->

<!-- snippet
id: grafana_security_audit_service_accounts
type: command
tech: grafana
level: intermediate
importance: medium
format: knowledge
tags: grafana,service-accounts,audit,tokens
title: Auditer les service accounts et leurs tokens
command: curl -s -u <ADMIN>:<PASSWORD> "https://<GRAFANA_FQDN>/api/serviceaccounts/search?perpage=100" | jq '.serviceAccounts[] | {name, role, tokens}'
example: curl -s -u admin:Str0ngPwd "https://grafana.example.com/api/serviceaccounts/search?perpage=100" | jq '.serviceAccounts[] | {name, role, tokens}'
description: Repère les comptes au rôle Admin ou avec des tokens que plus personne ne connaît ; à planifier chaque trimestre et après chaque départ.
-->

<!-- snippet
id: grafana_security_oauth_role_strict
type: concept
tech: grafana
level: intermediate
importance: high
format: knowledge
tags: grafana,oauth,sso,roles
title: role_attribute_strict : refuser par défaut au login SSO
content: role_attribute_path est une expression JMESPath évaluée sur le token ou userinfo pour déduire le rôle. Avec role_attribute_strict = true et sans valeur par défaut dans l'expression, un utilisateur hors des groupes attendus est refusé. Sans strict, il reçoit auto_assign_org_role et obtient un accès dont personne n'a décidé.
description: Le mapping de rôles est la vraie politique d'accès du SSO : sans refus par défaut, le SSO ne fait que déplacer l'authentification.
-->

<!-- snippet
id: grafana_security_auth_proxy_exposed
type: warning
tech: grafana
level: intermediate
importance: high
format: knowledge
tags: grafana,auth-proxy,reverse-proxy,spoofing
title: Auth proxy avec Grafana joignable en direct
content: Avec [auth.proxy] enabled = true et le port 3000 accessible sans passer par le proxy, un simple curl -H 'X-WEBAUTH-USER: admin' donne une session admin. Correction : http_addr = 127.0.0.1 ou réseau interne, whitelist avec les IP du proxy, et test nmap -Pn -p 3000 depuis l'extérieur.
description: L'auth proxy fait confiance à un en-tête non signé ; la sécurité repose entièrement sur l'impossibilité de contourner le proxy.
-->

<!-- snippet
id: grafana_security_datasource_proxy_whitelist
type: tip
tech: grafana
level: advanced
importance: medium
format: knowledge
tags: grafana,ssrf,datasource,hardening
title: Limiter les destinations des Data Sources
content: Dans [security], définir data_source_proxy_whitelist = <PROM_HOST>:9090 <LOKI_HOST>:3100 pour que le proxy de Data Source (/api/datasources/proxy) refuse toute autre destination. Selon la version, les requêtes passant par les backends de plugins (/api/ds/query) peuvent ne pas être couvertes : compléter par un filtrage réseau sortant, notamment vers 169.254.169.254. À mettre à jour à chaque ajout de backend.
description: Réduit, sans l'éliminer seul, l'impact SSRF des comptes Editor ou Admin d'organisation en limitant les hôtes joignables via le proxy de Data Source.
-->

<!-- snippet
id: grafana_security_loki_tenant_header_not_auth
type: warning
tech: grafana
level: advanced
importance: medium
format: knowledge
tags: grafana,loki,multi-tenant,isolation
title: X-Scope-OrgID n'est pas une authentification
content: Une Data Source Loki avec httpHeaderName1 = X-Scope-OrgID isole par convention : si Loki est joignable directement, n'importe qui peut choisir le tenant en envoyant l'en-tête. Correction : une passerelle qui authentifie et impose l'en-tête, et un filtrage réseau pour que Loki ne soit atteignable que par elle.
description: Le multi-tenant Loki sépare les données seulement si personne ne peut choisir lui-même la valeur de l'en-tête de tenant.
-->

<!-- snippet
id: grafana_security_logql_failed_logins
type: command
tech: grafana
level: intermediate
importance: medium
format: knowledge
tags: grafana,logql,detection,bruteforce
title: Compter les échecs de login Grafana par IP source
context: Suppose que les logs Grafana sont dans Loki avec le label app="grafana" ; le texte du message varie selon la version
command: sum by (remote_addr) (count_over_time({app="grafana"} |= "Invalid username or password" | logfmt [10m]))
description: Un pic sur une IP ou sur l'utilisateur admin signale un bourrage de credentials ; croise avec un login réussi depuis la même source.
-->

<!-- snippet
id: grafana_security_plugins_audit
type: command
tech: grafana
level: intermediate
importance: medium
format: knowledge
tags: grafana,plugins,audit,supply-chain
title: Lister les plugins installés pour détecter un écart
context: Sur anciennes versions, la commande est grafana-cli ; en conteneur, exécuter dans le conteneur Grafana
command: grafana cli plugins ls
description: Compare la sortie à la liste attendue dans votre image ; un plugin absent du Dockerfile indique une installation manuelle à investiguer.
-->

<!-- snippet
id: grafana_security_metrics_public
type: tip
tech: grafana
level: intermediate
importance: medium
format: knowledge
tags: grafana,metrics,reverse-proxy,hardening
title: Protéger l'endpoint /metrics de Grafana
content: Dans [metrics], définir basic_auth_username et basic_auth_password, et ajouter dans le reverse proxy location = /metrics { return 404; }. Prometheus scrape alors Grafana directement sur le réseau interne avec les credentials. Vérifier avec curl -s -o /dev/null -w '%{http_code}' https://<HOST>/metrics : on attend 404 ou 401.
description: Évite d'exposer version, volumétrie et noms de handlers à un scanner externe tout en gardant le scrape interne fonctionnel.
-->
