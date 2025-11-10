---
titre: Kubectl cmd
jour: 13|14|15
type: bonus
tags: Kubernetes, Bash, Virtualisation
---



# 📘 kubectl Cheat Sheet (niveau opération)

---

## 1. Cluster & Nœuds

```bash
kubectl cluster-info
kubectl get nodes
kubectl get nodes -o wide          # IP interne, runtime container, etc.
kubectl describe node <node>       # Détails d’un nœud (ressources, taints)
kubectl get all -A                 # Tout ce qui tourne dans TOUT le cluster

```

✔ Utilise ça dès que tu arrives sur un cluster pour vérifier qu’il répond et que les nœuds sont `Ready`.

---

## 2. Contexte & Namespace

### Voir où tu es connecté

```bash
kubectl config get-contexts        # Liste tous les contextes connus
kubectl config current-context     # Contexte actif
kubectl config view --minify       # Détails du contexte actuel

```

### Travailler dans un namespace spécifique

```bash
kubectl get pods -n kube-system
kubectl get svc -n default
kubectl get all -n monitoring

```

- `n <namespace>` = je regarde UNIQUEMENT cet espace logique.

### Changer le namespace par défaut de ton contexte actuel (qualité de vie)

```bash
kubectl config set-context --current --namespace=<ns>

```

💡 Namespaces utiles :

- `default` → bazar général (pas idéal mais classique).
- `kube-system` → trucs internes du cluster.
- `prod`, `staging`, `dev` → environnements séparés en entreprise.

---

## 3. Pods & Workloads de base

```bash
kubectl get pods
kubectl get pods -A                # Tous les pods tous namespaces
kubectl get pods -o wide           # Sur quel node tourne chaque pod
kubectl describe pod <pod> -n <ns> # Détails d’un pod (events, image, IP)
kubectl logs <pod> -n <ns>         # Logs du conteneur principal
kubectl logs <pod> -c <container>  -n <ns> # Logs d’un conteneur spécifique dans le pod
kubectl exec -it <pod> -n <ns> -- sh      # Ouvrir un shell dans le pod

```

Astuce :

- Status suspects : `CrashLoopBackOff`, `ImagePullBackOff`, `Pending`.

---

## 4. Deployments

```bash
kubectl get deployments -A
kubectl get deployment <name> -n <ns> -o wide
kubectl describe deployment <name> -n <ns>

# Mettre à l’échelle
kubectl scale deployment <name> --replicas=3 -n <ns>

# Mettre à jour l’image
kubectl set image deployment/<name> <container>=<image:tag> -n <ns>
# ex:
kubectl set image deployment/webapp web=nginx:1.27 -n default

# Voir l'état du rollout (déploiement progressif)
kubectl rollout status deployment/<name> -n <ns>

# Revenir à la version précédente
kubectl rollout undo deployment/<name> -n <ns>

```

💡 Un Deployment = gestion vivante du service stateless (web, API, etc.).

---

## 5. ReplicaSets

Le ReplicaSet est ce qui garantit “je veux N pods identiques en permanence”.

```bash
kubectl get rs -A
kubectl describe rs <name> -n <ns>

```

Tu ne modifies presque jamais un ReplicaSet directement.

C’est le Deployment qui les régénère / remplace.

Utile quand :

- tu veux comprendre pourquoi un vieux ReplicaSet traîne,
- des pods zombies tournent encore sur une ancienne version.

---

## 6. StatefulSets

Pour les services AVEC état (base de données, stockage persistant, nom stable).

```bash
kubectl get statefulsets -A
kubectl describe statefulset <name> -n <ns>
kubectl get pods -l app=<label> -n <ns> -o wide

```

⚠️ Ne scale pas un StatefulSet à l’arrache sans comprendre la data.

Si tu fais :

```bash
kubectl scale statefulset <name> --replicas=3 -n <ns>

```

Tu crées `app-0`, `app-1`, `app-2` avec chacun son volume propre.

---

## 7. DaemonSets

Un DaemonSet = “ce Pod doit tourner sur CHAQUE nœud du cluster” (monitoring, logs, réseau).

```bash
kubectl get daemonsets -A
kubectl describe daemonset <name> -n <ns>
kubectl get pods -n <ns> -o wide | grep <daemonset-name>

```

Tu l’inspectes pour :

- vérifier qu’il tourne bien partout,
- repérer des agents de logging/monitoring installés par d’autres équipes.

---

## 8. Services & Réseau Interne

```bash
kubectl get svc -A -o wide
kubectl describe svc <name> -n <ns>

```

Colonne `TYPE` :

- `ClusterIP` : interne au cluster
- `NodePort` : accessible via un port ouvert sur les nœuds
- `LoadBalancer` : expose publiquement via un LB (cloud / externe)

💡 Vérifie surtout les `NodePort` et `LoadBalancer` : ça te dit ce qui est potentiellement visible de l’extérieur 👀

---

## 9. Ingress (routage HTTP / HTTPS)

```bash
kubectl get ingress -A
kubectl describe ingress <name> -n <ns>

```

Tu obtiens :

- les domaines exposés (`HOSTS`),
- les chemins (`/`, `/api`, `/admin`…),
- et vers quel Service ça envoie.

Utile pour voir ce qui est réellement accessible depuis l’extérieur (reverse proxy logique du cluster).

---

## 10. Labels & Sélecteurs

Les labels sont des étiquettes attachées aux objets.

Tu peux filtrer tout le cluster par label.

Lister les labels d’un pod :

```bash
kubectl get pod <pod> -n <ns> --show-labels

```

Lister tous les pods qui ont par exemple `app=web` :

```bash
kubectl get pods -l app=web -n <ns>
kubectl get svc  -l app=web -n <ns>
kubectl get deployment -l app=web -n <ns>

```

Ajouter ou modifier un label :

```bash
kubectl label pod <pod> env=staging -n <ns>
# ajoute env=staging

```

💡 Les Services, Deployments, etc. utilisent ces labels pour faire le lien entre eux.

Exemple : un Service envoie le trafic à tous les Pods qui matchent `app=web`.

---

## 11. ConfigMap (config non sensible)

Lister :

```bash
kubectl get configmap -A
kubectl describe configmap <name> -n <ns>
kubectl get configmap <name> -n <ns> -o yaml

```

Créer rapidement un ConfigMap depuis le CLI (impératif) :

```bash
kubectl create configmap app-config \
  --from-literal=APP_MODE=production \
  --from-literal=NGINX_VERSION=1.2.4 \
  -n <ns>

```

Créer à partir d’un fichier de config local :

```bash
kubectl create configmap app-config \
  --from-file=./config/app.properties \
  -n <ns>

```

Astuce :

Les ConfigMaps sont injectables en variables d’env ou fichiers montés dans un Pod.

---

## 12. Secret (données sensibles)

Lister :

```bash
kubectl get secrets -A
kubectl describe secret <name> -n <ns>    # ATTENTION: n’affiche pas les valeurs
kubectl get secret <name> -n <ns> -o yaml # Valeurs encodées base64

```

Créer un Secret “opaque” à la volée :

```bash
kubectl create secret generic db-secret \
  --from-literal=DB_USER=developer \
  --from-literal=DB_PASSWORD=secret123 \
  -n <ns>

```

Récupérer la vraie valeur en décodant (exemple Bash) :

```bash
kubectl get secret db-secret -n <ns> -o jsonpath='{.data.DB_PASSWORD}' | base64 --decode

```

💡 Jamais de mot de passe en clair dans un manifest Git public → utilise les Secrets.

---

## 13. Variables d’environnement dans les Pods

Voir les env vars d’un Pod en live :

```bash
kubectl exec -it <pod> -n <ns> -- env

```

Très utile pour vérifier que ton `ConfigMap` ou ton `Secret` est bien injecté.

---

## 14. Volumes persistants (PV/PVC)

PV = volume dispo dans le cluster.

PVC = “je réclame du stockage pour mon Pod”.

Lister le stockage :

```bash
kubectl get pv
kubectl get pvc -A
kubectl describe pvc <name> -n <ns>

```

À surveiller :

- `STATUS` doit être `Bound`
- `CAPACITY` = taille
- `STORAGECLASS` = backend de stockage (local-path, nfs, gp2, etc.)

✔ C’est ici que tu vois quelles applis ont des données critiques qui ne doivent pas être supprimées sauvagement.

---

## 15. Jobs & CronJobs (tâches ponctuelles / planifiées)

Lister :

```bash
kubectl get jobs -A
kubectl get cronjobs -A

kubectl describe job <name> -n <ns>
kubectl describe cronjob <name> -n <ns>

```

Comprendre l’état :

- `COMPLETIONS` dans un Job → ex `1/1` = ok, `0/1` = échec.
- `LAST SCHEDULE` dans un CronJob → quand ça a tourné la dernière fois.

Créer rapidement un job impératif (run unique) :

```bash
kubectl create job cleanup --image=alpine -- sh -c "echo nettoyage && sleep 5"
# lance un Pod une fois, l’exécute puis termine

```

Voir les pods générés par ce job :

```bash
kubectl get pods -l job-name=cleanup
kubectl logs <pod_du_job>

```

---

## 16. HPA (Horizontal Pod Autoscaler)

L’HPA ajuste automatiquement le nombre de Pods selon la charge (CPU, mémoire…).

Voir les HPA :

```bash
kubectl get hpa -A
kubectl describe hpa <name> -n <ns>

```

Créer un HPA de base (ex : scale entre 3 et 10 replicas si CPU > 80%) :

```bash
kubectl autoscale deployment web-deployment \
  --cpu-percent=80 --min=3 --max=10 \
  -n <ns>

```

Note :

- HPA cible un `Deployment` ou un `StatefulSet`.
- Nécessite que le cluster ait des metrics (metrics-server).

---

## 17. Événements / Debug rapide

```bash
kubectl get events --sort-by=.lastTimestamp
kubectl describe pod <pod> -n <ns>
kubectl logs <pod> -n <ns> --tail=100

```

C’est ton radar d’alerte pour :

- pods qui redémarrent,
- images qui ne se téléchargent pas,
- ressources insuffisantes (pas assez de CPU/RAM dispo pour scheduler un pod),
- probes qui échouent.

---

## 18. Appliquer / Supprimer des manifests (déclaratif)

```bash
kubectl apply -f monfichier.yaml
kubectl delete -f monfichier.yaml

```

Voir ce qui va changer AVANT de l’appliquer :

```bash
kubectl diff -f monfichier.yaml

```

Utile pour éviter de pousser une connerie.

---

## 19. Création rapide (impératif)

C’est pour tester vite fait une ressource sans écrire le YAML à la main.

### Lancer un déploiement nginx :

```bash
kubectl create deployment nginx --image=nginx

```

### L’exposer (ouvrir du réseau) :

```bash
kubectl expose deployment nginx --type=NodePort --port=80

```

### Vérifier le service créé :

```bash
kubectl get svc
kubectl describe svc nginx

```

### (Minikube) Obtenir l’URL externe directe :

```bash
minikube service nginx --url

```

---

## 20. Résumé mental : dans quel ordre tu travailles

1. 🔍 “Le cluster est vivant ?”

```bash
kubectl cluster-info
kubectl get nodes -o wide

```

1. 🗂 “Je suis dans quel namespace / contexte ?”

```bash
kubectl config current-context
kubectl get pods -A

```

1. 👀 “Quelles applis tournent ?”

```bash
kubectl get deployments -A
kubectl get statefulsets -A
kubectl get daemonsets -A
kubectl get svc -A -o wide
kubectl get ingress -A

```

1. 💾 “Qui stocke de la donnée critique ?”

```bash
kubectl get pvc -A
kubectl get pv

```

1. 🔐 “Secrets / config en place ?”

```bash
kubectl get secrets -A
kubectl get configmap -A

```

1. ⏱ “Qu’est-ce qui tourne automatiquement sans moi ?”

```bash
kubectl get cronjobs -A
kubectl get jobs -A
kubectl get hpa -A

```

1. 🚨 “Y a un feu quelque part ?”

```bash
kubectl get events --sort-by=.lastTimestamp

```

---

## ⚙️ Options globales les plus courantes dans `kubectl`

| Option | Longue forme | Signification | Exemple pratique |
| --- | --- | --- | --- |
| `-A` | `--all-namespaces` | Affiche les objets de **tous les namespaces** du cluster. | `kubectl get pods -A` → liste tous les Pods du cluster. |
| `-n <namespace>` | `--namespace <ns>` | Filtre sur **un namespace précis**. | `kubectl get svc -n kube-system` → montre les services système. |
| `-o wide` | `--output wide` | Donne **plus d’infos** (IP, node, conteneur, etc.). | `kubectl get pods -o wide` → IP, Node, image. |
| `-o yaml` | `--output yaml` | Affiche l’objet au **format YAML complet** (utile pour comprendre la config réelle). | `kubectl get deployment web -o yaml` |
| `-o json` | `--output json` | Même chose que YAML, mais en JSON (utile pour scripting ou parsing). | `kubectl get pod web -o json` |
| `-l <clé=valeur>` | `--selector <clé=valeur>` | Filtre par **label** (sélecteur). | `kubectl get pods -l app=web` |
| `--show-labels` |  | Affiche les **labels** dans les résultats de `get`. | `kubectl get pods --show-labels` |
| `--sort-by=<champ>` |  | Trie la sortie selon un champ JSONPath. | `kubectl get events --sort-by=.lastTimestamp` |
| `--field-selector` |  | Filtre par **valeur d’un champ** système (ex : status.phase). | `kubectl get pods --field-selector status.phase=Running` |
| `-w` | `--watch` | Surveille les changements en **temps réel**. | `kubectl get pods -w` → met à jour quand un Pod change. |
| `--all` |  | Sur certaines commandes (`delete`, etc.) → agit sur **tous les objets** du type demandé. | `kubectl delete pods --all -n dev` |
| `--dry-run=client` |  | Simule la création sans l’appliquer réellement (très utile pour tests). | `kubectl create deployment test --image=nginx --dry-run=client -o yaml` |
| `--context <nom>` |  | Force l’utilisation d’un autre **contexte kubeconfig**. | `kubectl get pods --context=minikube` |
| `--kubeconfig <fichier>` |  | Spécifie un autre fichier kubeconfig. | `kubectl get nodes --kubeconfig ~/.kube/k3s-config` |

---

## 💡 Notes utiles :

- `A` (All namespaces) et `n` (Namespace) sont **mutuellement exclusifs** → tu choisis l’un ou l’autre.
- `o wide` est ton **meilleur ami** pour le diagnostic : IP, Node, images… sans tout le YAML.
- `o yaml` est top pour **copier une ressource existante** et la modifier.
- `-dry-run=client -o yaml` → astuce de pro : crée un manifest YAML prêt à sauvegarder sans impacter le cluster.

---

Exemples combinés :

```bash
# Voir tous les pods avec plus de détails
kubectl get pods -A -o wide

# Voir les deployments du namespace "prod"
kubectl get deployments -n prod

# Voir les services qui ont le label "env=staging"
kubectl get svc -l env=staging -A

# Surveiller les pods en direct dans le namespace "api"
kubectl get pods -n api -w

```

---

## 1. Commandes d’inspection (lire l’état du cluster)

### 🔍 `kubectl get`

**But :** lister les ressources existantes.

Tu peux l’utiliser sur presque tout :

- `pods` / `po`
- `deployments` / `deploy`
- `statefulsets` / `sts`
- `daemonsets` / `ds`
- `svc` (services)
- `ingress` / `ing`
- `configmap` / `cm`
- `secret`
- `job`, `cronjob`
- `pv`, `pvc`
- `nodes`
- `ns` (namespaces)
- `hpa`
- etc.

Exemples :

```bash
kubectl get pods -n default
kubectl get deployments -A
kubectl get svc -o wide
kubectl get pvc -n database
kubectl get hpa -A
kubectl get nodes
kubectl get ingress -n web

```

Options utiles :

- `A` → tous les namespaces
- `n <ns>` → un namespace spécifique
- `o wide` → détails en plus (IP pod, node hôte, image, etc.)
- `-show-labels` → affiche les labels

---

### 📄 `kubectl describe`

**But :** afficher les détails complets d’une ressource précise.

Tu l’utilises pour comprendre “pourquoi ça marche / pourquoi ça casse”.

Fonctionne sur :

- Pod
- Deployment / StatefulSet / DaemonSet
- Service
- Ingress
- PVC
- Node
- Job / CronJob
- HPA
- Secret / ConfigMap (structure)

Exemples :

```bash
kubectl describe pod web-5c8d7f8d9c-abc12 -n default
kubectl describe deployment web -n default
kubectl describe node minikube
kubectl describe pvc db-data -n database
kubectl describe ingress web-ingress -n web

```

Ce que tu vois :

- events récents
- erreurs probes (readiness/liveness)
- image utilisée
- volumes montés
- sélecteurs de labels
- scheduling

Très utilisé en debug.

---

### 📘 `kubectl explain`

**But :** avoir la doc intégrée du schéma Kubernetes.

Tu lui demandes “explique-moi cette ressource et ses champs”.

Exemples :

```bash
kubectl explain pod
kubectl explain deployment.spec
kubectl explain deployment.spec.template.spec.containers
kubectl explain ingress.spec.rules
kubectl explain pvc.spec

```

Tu peux descendre dans la hiérarchie `spec`, `template`, etc.

C’est incroyable pour comprendre `spec` dans `spec`.

---

### 📜 `kubectl logs`

**But :** lire les logs applicatifs d’un conteneur.

Objectif : comprendre ce que fait l’app dans le Pod.

Tu l’utilises sur :

- Pods (et optionnellement un conteneur dans ce pod)

Exemples :

```bash
kubectl logs mypod-abc123 -n default
kubectl logs mypod-abc123 -c web -n default   # si plusieurs conteneurs dans le pod
kubectl logs mypod-abc123 --tail=100 -n default
kubectl logs mypod-abc123 -f -n default       # -f = "follow" (stream en direct)

```

---

### 📊 `kubectl top`

**But :** voir l’utilisation CPU / RAM en live.

Besoin du metrics-server dans le cluster.

Fonctionne sur :

- nodes
- pods

Exemples :

```bash
kubectl top nodes
kubectl top pods -n default
kubectl top pods -A

```

Pratique pour repérer qui consomme tout le CPU.

---

### 📅 `kubectl events`

**But :** lister les événements récents du cluster (erreurs, scheduling, etc.).

```bash
kubectl get events --sort-by=.lastTimestamp

```

Ça te dit si :

- un pod est en crashloop,
- une image ne peut pas être pull,
- un node est NotReady,
- un volume PVC n’arrive pas à se binder…

---

## 2. Commandes d’accès / d’interaction directe

### 🖥 `kubectl exec`

**But :** entrer dans un conteneur pour exécuter une commande.

Exemples :

```bash
kubectl exec -it mypod-abc123 -n default -- sh
kubectl exec -it mypod-abc123 -c web -n default -- bash
kubectl exec mypod-abc123 -n default -- ls /app

```

Tu utilises ça pour :

- debug interne,
- vérifier variables d’environnement,
- tester la connectivité réseau depuis le pod.

---

### 🔗 `kubectl port-forward`

**But :** rediriger un port local → un pod (ou un service) dans le cluster.

Exemples :

```bash
kubectl port-forward pod/mypod-abc123 8080:80 -n default
kubectl port-forward svc/web-service 8080:80 -n default

```

Après ça tu ouvres `http://localhost:8080` dans ton navigateur → tu tapes directement l’app interne sans exposer tout le cluster.

Très utile en dev/sécu.

---

### 📂 `kubectl cp`

**But :** copier des fichiers entre ta machine locale et un conteneur.

```bash
kubectl cp ./config.json default/mypod-abc123:/app/config.json
kubectl cp default/mypod-abc123:/var/log/app.log ./app.log

```

Pratique pour récupérer des logs ou pousser un fichier de test.

---

### 📎 `kubectl attach`

**But :** s’attacher à un conteneur déjà en cours d’exécution et voir STDOUT/STDERR (sans lancer une nouvelle commande comme `exec`).

Plus utilisé pour du debug interactif ou des conteneurs qui tournent en mode TTY.

---

### 🌐 `kubectl proxy`

**But :** lance un proxy local qui permet d’appeler l’API Kubernetes en HTTP depuis ta machine (souvent utilisé pour faire des requêtes à l’API Server sans se prendre la tête avec les certificats).

```bash
kubectl proxy
# Ensuite tu peux faire des curl sur http://127.0.0.1:8001/api/...

```

---

## 3. Commandes de création / modification de ressources

Il y a deux styles dans Kubernetes :

- “Impératif” → tu demandes une action directe (ex: crée un deployment nginx).
- “Déclaratif” → tu fournis un fichier YAML qui décrit l’état voulu.

On couvre les deux.

---

### 🏗 `kubectl create`

**But :** créer une ressource à partir d’arguments (impératif) OU d’un fichier.

Exemples typiques :

```bash
# Créer un deployment rapide sans écrire de YAML
kubectl create deployment web --image=nginx

# Créer un service ClusterIP ou NodePort
kubectl expose deployment web --type=NodePort --port=80

# Créer un configmap
kubectl create configmap app-config \
  --from-literal=APP_MODE=production \
  -n default

# Créer un secret
kubectl create secret generic db-secret \
  --from-literal=DB_USER=dev \
  --from-literal=DB_PASS=azerty \
  -n default

# Créer un job
kubectl create job cleanup --image=alpine -- sh -c "echo clean && sleep 5"

# Créer à partir d’un fichier YAML
kubectl create -f monobjet.yaml

```

💡 Variante puissante :

```bash
kubectl create deployment api --image=nginx --dry-run=client -o yaml

```

→ Ne le crée pas, génère juste le YAML pour que TU puisses le sauvegarder dans un fichier. Ça t’aide à écrire des manifests propres.

---

### 🛠 `kubectl apply`

**But :** appliquer un fichier YAML d’état désiré.

C’est le mode “déclaratif”, celui à privilégier en vrai projet.

```bash
kubectl apply -f deployment.yaml
kubectl apply -f ./dossier_manifests/

```

- Crée la ressource si elle n’existe pas
- Met à jour si elle existe

C’est ce qu’on versionne en Git en prod.

---

### 📝 `kubectl edit`

**But :** ouvrir la ressource dans ton `$EDITOR` (nano/vim), modifier en live, sauvegarder, et kubectl applique la modif direct sur le cluster.

Exemple :

```bash
kubectl edit deployment web -n default
kubectl edit configmap app-config -n default
kubectl edit hpa web-hpa -n default

```

⚠ Attention : ça modifie en prod en live, sans historique Git. C’est très pratique en labo / urgence.

---

### 🧩 `kubectl patch`

**But :** modifier juste un champ précis d’une ressource sans tout réécrire.

Exemple (ajouter un label au Pod) :

```bash
kubectl patch pod mypod-abc123 -n default \
  -p '{"metadata":{"labels":{"env":"staging"}}}'

```

Tu peux aussi patcher un déploiement pour changer l’image, etc.

---

### 🔁 `kubectl replace`

**But :** remplacer une ressource ENTIEREMENT à partir d’un fichier.

Différence avec `apply` : `replace` exige que la ressource existe déjà.

Exemple :

```bash
kubectl replace -f deployment.yaml

```

---

### ❌ `kubectl delete`

**But :** supprimer des ressources.

```bash
# Supprimer une ressource précise
kubectl delete pod mypod-abc123 -n default

# Supprimer via un fichier
kubectl delete -f deployment.yaml

# Supprimer tous les pods d’un ns
kubectl delete pod --all -n default

# Supprimer par label (danger 😈 mais utile)
kubectl delete pod -l app=web -n default

```

---

## 4. Commandes de déploiement / rollout / scaling

### 🔄 `kubectl rollout`

Gestion du cycle de déploiement d’un Deployment.

```bash
kubectl rollout status deployment/web -n default     # suivre la progression
kubectl rollout history deployment/web -n default    # historique des révisions
kubectl rollout undo deployment/web -n default       # rollback

```

---

### 📈 `kubectl scale`

Changer le nombre de réplicas pour un Deployment, ReplicaSet, StatefulSet, etc.

```bash
kubectl scale deployment web --replicas=5 -n default
kubectl scale statefulset db --replicas=3 -n database

```

---

### 🤖 `kubectl autoscale`

Créer un HPA (Horizontal Pod Autoscaler) pour scaler automatiquement.

```bash
kubectl autoscale deployment web \
  --cpu-percent=80 --min=3 --max=10 \
  -n default

```

Fonctionne aussi avec statefulset, replicaset, etc.

---

## 5. Commandes de gestion du cluster lui-même (nœuds)

Ça c’est plus “admin cluster” que “dev app”, mais important.

### 🧊 `kubectl cordon`

Marque un nœud comme **non programmable** (= on n’y placera plus de nouveaux Pods).

```bash
kubectl cordon <node-name>

```

### 🔥 `kubectl drain`

Vider un nœud (éjecter les pods) en vue de maintenance.

```bash
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

```

> “Va dormir, je vais le patcher / le redémarrer.”
> 

### 🌞 `kubectl uncordon`

Permet à nouveau de programmer des Pods sur ce nœud.

```bash
kubectl uncordon <node-name>

```

---

### 🧪 `kubectl taint`

Ajouter / enlever une taint = dire “ce nœud n’accepte que certains Pods qui ont la tolérance correspondante”.

```bash
kubectl taint nodes <node> key=value:NoSchedule
kubectl taint nodes <node> key=value:NoSchedule-
# le "-" à la fin = retirer la taint

```

Utilisé pour réserver un nœud à un rôle précis (par exemple uniquement pour des workloads sensibles ou base de données).

---

## 6. Commandes d’organisation / metadata

### 🏷 `kubectl label`

Ajouter / modifier des labels sur une ressource.

```bash
kubectl label pod mypod-abc123 env=staging -n default
kubectl label deployment web tier=frontend -n default --overwrite

```

Tu utilises les labels pour :

- cibler un Service,
- cibler une Ingress,
- cibler un HPA,
- filtrer plus tard : `kubectl get pods -l env=staging`

---

### 📝 `kubectl annotate`

Ajouter des annotations (métadonnées libres, plus longues que les labels).

```bash
kubectl annotate pod mypod-abc123 owner="goose" -n default

```

Souvent utilisé pour la doc interne, l’audit, l’intégration avec d’autres outils (monitoring, CI/CD).

---

## 7. Commandes info système / API

### 🌐 `kubectl api-resources`

Liste TOUT ce que ton serveur API supporte comme type d’objet, avec le group/version.

```bash
kubectl api-resources

```

Tu peux voir :

- `pods` (core/v1)
- `deployments` (apps/v1)
- `ingresses` (networking.k8s.io/v1)
- `horizontalpodautoscalers` (autoscaling/v2)
- etc.

C’est génial pour découvrir “comment s’appelle officiellement la ressource que je veux get ?”

---

### 📚 `kubectl api-versions`

Liste toutes les versions d’API supportées.

```bash
kubectl api-versions

```

C’est utile pour comprendre pourquoi certains manifests utilisent `apiVersion: apps/v1` et d’autres `apiVersion: batch/v1`.

---

### ⚙️ `kubectl config`

Gère le kubeconfig (contexte, user, cluster).

```bash
kubectl config get-contexts
kubectl config current-context
kubectl config set-context --current --namespace=dev

```

---

### 🧪 `kubectl diff`

Montre ce qui changerait si tu faisais un `kubectl apply`.

```bash
kubectl diff -f deployment.yaml

```

Super propre en prod : tu vois le delta AVANT d’appliquer.

---

### ⏳ `kubectl wait`

Attendre une condition précise.

```bash
kubectl wait --for=condition=available deployment/web -n default --timeout=60s

```

Exemple logique : “j’attends que le déploiement soit prêt avant de continuer le script CI/CD”.

---

## Ce que tu peux retenir rapidement

- Pour LISTER → `get`
- Pour VOIR EN DÉTAIL → `describe`
- Pour VOIR LES LOGS → `logs`
- Pour ENTRER DANS LE CONTENEUR → `exec -it ... -- sh`
- Pour CRÉER VITE → `create`
- Pour GÉRER EN YAML → `apply`, `delete`, `diff`
- Pour SCALE / ROLLOUT → `scale`, `rollout`, `autoscale`
- Pour le réseau externe → `get svc`, `get ingress`
- Pour le stockage → `get pvc`, `get pv`
- Pour les tâches programmées → `get jobs`, `get cronjobs`
- Pour les secrets/config → `get secret`, `get configmap`
- Pour l’état du cluster → `cluster-info`, `get nodes`, `top nodes`, `get events`