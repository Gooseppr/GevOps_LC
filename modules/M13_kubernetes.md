---
module: Kubernetes
jour: 13
ordre: 1
tags: kubernetes, bash, linux
---


# 🧠 KUBERNETES (K8S)

---

## 1. Introduction — Pourquoi Kubernetes existe ?

Quand tu travailles avec Docker, tu peux très bien créer et exécuter un conteneur sur ta machine :

```bash
docker run -d -p 8080:80 nginx

```

C’est simple, mais… ça ne passe **pas à l’échelle**.

En entreprise, une application n’est pas un seul conteneur :

c’est **plusieurs services** (frontend, backend, base de données, proxy, files, etc.)

qui tournent sur **plusieurs serveurs physiques ou virtuels**.

Or gérer tout ça manuellement devient vite infernal.

Kubernetes — souvent abrégé **K8S** — est un **système d’orchestration de conteneurs**.

Il automatise **le déploiement, la gestion, la mise à l’échelle, la supervision et la réparation**

de milliers de conteneurs répartis sur plusieurs machines.

### 🎯 Objectif principal :

> « Définir l’état désiré d’une application (combien de conteneurs, quelle image, quels ports, quelle configuration),
> 
> 
> et laisser Kubernetes se charger de le maintenir. »
> 

Autrement dit, **tu déclares ce que tu veux, pas comment le faire.**

Kubernetes s’occupe du “comment”.

---

## 2. Du conteneur unique au cluster distribué

### 🔸 Docker (de base)

Tu lances un **conteneur** à la main.

C’est pratique pour tester une appli, un service unique ou un prototype.

### 🔸 Docker Compose

Tu définis une **application complète sur une seule machine**.

Un fichier `docker-compose.yml` décrit tes services, réseaux et volumes.

→ Parfait pour du **développement local**, mais pas fait pour répartir sur plusieurs serveurs.

### 🔸 Kubernetes

Tu définis ton application dans des **manifests YAML** (plus riches que Compose),

et Kubernetes déploie automatiquement **tes conteneurs sur plusieurs serveurs**,

les **réplique**, les **supervise**, et les **remplace** si un crash survient.

---

## 3. Différences majeures entre Docker, Docker Compose et Kubernetes

| Aspect | Docker | Docker Compose | Kubernetes |
| --- | --- | --- | --- |
| **Échelle** | Conteneurs isolés sur 1 machine | Plusieurs conteneurs sur 1 machine | Plusieurs conteneurs sur plusieurs machines |
| **Objectif** | Exécuter des conteneurs manuellement | Définir un environnement multi-conteneurs | Orchestrer, répliquer et surveiller un cluster |
| **Format de définition** | Commandes CLI | `docker-compose.yml` | Fichiers YAML (pods, deployments, services, etc.) |
| **Réseau** | Bridge local | Réseau interne Compose | Réseau distribué entre nœuds (DNS interne) |
| **Persistance** | Volumes | Volumes gérés localement | Volumes persistants (PV/PVC, StorageClass) |
| **Supervision** | `docker ps`, `logs` | `docker compose logs` | `kubectl get`, `kubectl describe`, probes |
| **Disponibilité** | Si un conteneur tombe, tu le relances à la main | idem | Kubernetes le recrée automatiquement |
| **Scalabilité** | Manuelle | Limitée | Automatique (autoscaling, rolling updates) |
| **Usage typique** | Tests unitaires, micro-services isolés | Stack locale complète | **Production, staging, haute disponibilité** |

---

## 4. L’architecture de Kubernetes

![Schéma](../images/Capture%20d%E2%80%99%C3%A9cran%202025-10-29%20%C3%A0%2011.49.48.png)

Kubernetes fonctionne comme une **grande ferme de serveurs**, appelée **cluster**.

Un **cluster Kubernetes** est composé de :

### 🧩 1. Le **Master Node** (aussi appelé *Control Plane*)

C’est le cerveau du cluster.

Il orchestre et décide :

- où déployer chaque Pod,
- combien de Pods doivent tourner,
- quand relancer un Pod tombé,
- quand scaler ou faire une mise à jour progressive.

Il contient plusieurs composants clés :

- **API Server** : point d’entrée, interface avec `kubectl`
- **Scheduler** : planifie où placer les Pods
- **Controller Manager** : surveille et corrige les états (création, remplacement, etc.)
- **etcd** : base de données interne du cluster (stocke l’état global)

### 🖥️ 2. Les **Worker Nodes**

Ce sont les serveurs qui **hébergent les conteneurs**.

Chaque worker contient :

- **kubelet** : agent local qui exécute les Pods ordonnés par le master
- **kube-proxy** : gère le routage réseau interne
- **runtime** : Docker ou containerd (moteur qui exécute les conteneurs)

### 🧱 3. Les **Pods**

L’unité de base de Kubernetes.

Un **Pod** contient **un ou plusieurs conteneurs** qui fonctionnent ensemble (souvent un seul).

Tous les conteneurs d’un Pod partagent :

- le même réseau interne,
- les mêmes volumes montés.

Si un Pod tombe, Kubernetes en recrée un automatiquement.

> 💡 “Pod = mini Compose de un ou plusieurs conteneurs fonctionnant ensemble.”
> 

### 🌐 4. Les **Services**

Les Pods sont temporaires, ils peuvent changer d’adresse IP.

Le **Service** donne une **adresse stable** et peut faire du **load balancing**.

Types principaux :

- **ClusterIP** : interne au cluster
- **NodePort** : accessible depuis l’extérieur (par un port du nœud)
- **LoadBalancer** : exposé publiquement (cloud)
- **Ingress** : routage HTTP/HTTPS plus fin

---

## 5. Pourquoi Kubernetes est si puissant ? (bénéfices clés)

| Besoin | Ce que fait Kubernetes |
| --- | --- |
| **Haute disponibilité (HA)** | Réplication automatique des Pods sur plusieurs serveurs |
| **Scalabilité** | Ajuste dynamiquement le nombre de Pods (ex : HPA) |
| **Résilience** | Auto-guérison (restart de Pods défaillants) |
| **Mises à jour sans coupure** | Rolling updates + rollback instantané |
| **Portabilité** | Même YAML que ce soit en local, sur AWS, GCP, Azure |
| **Séparation des ressources** | Namespaces, quotas CPU/RAM, règles RBAC |
| **Monitoring intégré** | Events, metrics, probes, dashboard |
| **Déploiement GitOps possible** | Déployer depuis un dépôt YAML versionné |

---

## 6. Cas concrets d’utilisation de Kubernetes

### 🏢 1. Entreprise multi-environnements

Une société héberge ses microservices (API, frontend, DB) dans un **cluster Kubernetes** unique.

Chaque environnement (dev / staging / prod) est isolé dans un **namespace**.

### ⚙️ 2. Application à forte charge

Un site e-commerce reçoit un pic de trafic → Kubernetes ajoute automatiquement des réplicas.

Quand le trafic retombe, il les supprime.

### 🔄 3. Mises à jour progressives

Tu veux passer de `v1` à `v2` sans coupure :

- Kubernetes met à jour les Pods 1 par 1,
- surveille les probes de santé,
- stoppe le déploiement si erreur.

### 💥 4. Résilience automatique

Un serveur (worker node) tombe ?

Le master redéploie immédiatement les Pods sur un autre nœud.

### 🧮 5. Cloud hybride

Une partie du cluster en local, une autre dans le cloud : même orchestration, même YAML.

---

## 7. Minikube — Kubernetes sur ta machine

Kubernetes est prévu pour un cluster complet (plusieurs serveurs).

Mais pour apprendre et tester, on utilise **Minikube** ou **K3S** :

des versions légères qui simulent un cluster complet **en local** sur ta machine.

> Minikube embarque un “master” et un “worker” dans une même VM ou via Docker.
> 

---

### 🟢 Installation de Minikube

#### Sous Windows (PowerShell)

```powershell
choco install minikube -y
choco install kubernetes-cli -y
minikube version
kubectl version --client

```

#### Sous Linux

```bash
sudo apt update
sudo apt install -y curl apt-transport-https gnupg
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | \
  sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /" | \
  sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update
sudo apt install -y kubectl


```

#### Démarrage du cluster

- Avec **docker**

```bash
sudo usermod -aG docker $USER
newgrp docker

minikube start --driver=docker

```

---

### 🟠 Installation de K3S

#### Sous Linux

```bash
curl -sfL https://get.k3s.io | sh -

```

#### Vérifications

```bash
sudo k3s kubectl get nodes
sudo k3s kubectl get pods -A

```

#### Alias pour kubectl

```bash
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
export KUBECONFIG=~/.kube/config
kubectl get nodes

```

#### Désinstallation

```bash
sudo /usr/local/bin/k3s-uninstall.sh

```

---

### 🔵 Installation de Kubernetes (kubeadm)

#### Préparation

```bash
sudo apt update && sudo apt install -y apt-transport-https ca-certificates curl
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg \
  https://packages.cloud.google.com/apt/doc/apt-key.gpg
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] \
https://apt.kubernetes.io/ kubernetes-xenial main" | \
sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt update && sudo apt install -y kubelet kubeadm kubectl containerd
sudo systemctl enable kubelet && sudo systemctl start kubelet

```

#### Initialisation du master

```bash
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

```

#### Configuration kubectl

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

```

#### Installation du réseau

```bash
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

```

#### Ajout de nœud secondaire

```bash
sudo kubeadm join <ip_master>:6443 --token <TOKEN> --discovery-token-ca-cert-hash <HASH>

```

#### Vérifications

```bash
kubectl get nodes
kubectl get pods -A

```

## 8. Kubectl — le terminal de Kubernetes

`kubectl` est la **CLI de Kubernetes**.

Elle permet de gérer tous les objets du cluster : Pods, Services, Deployments, etc.

---

### 📘 Commandes de base

#### Cluster & nœuds

```bash
kubectl cluster-info
kubectl get nodes
kubectl get all -A

```

#### Pods & Deployments

```bash
kubectl get pods
kubectl get deployments
kubectl describe pod <nom>
kubectl logs <nom_du_pod>

```

#### Création rapide (impérative)

```bash
kubectl create deployment nginx --image=nginx
kubectl expose deployment nginx --type=NodePort --port=80
kubectl get svc
minikube service nginx --url

```

#### Édition YAML (déclaratif)

```bash
kubectl apply -f deployment.yaml
kubectl delete -f deployment.yaml

```

#### Échelle / mise à jour

```bash
kubectl scale deployment nginx --replicas=3
kubectl set image deployment/nginx nginx=nginx:1.27
kubectl rollout status deployment/nginx
kubectl rollout undo deployment/nginx

```

#### Debug

```bash
kubectl exec -it <pod> -- sh
kubectl get events --sort-by=.lastTimestamp

```

### Bonus perso : Commandes check-list d'arrivée

```bash
# Minikube ?
if command -v minikube >/dev/null 2>&1; then
    echo "[INFO] Minikube détecté"
fi

minikube status
minikube start

# K3s ?
if systemctl list-units --type=service | grep -q k3s; then
    echo "[INFO] K3s détecté"
fi

sudo systemctl start k3s 2>/dev/null
mkdir -p $HOME/.kube
sudo cat /etc/rancher/k3s/k3s.yaml > $HOME/.kube/config 2>/dev/null
chmod 600 $HOME/.kube/config 2>/dev/null

# kubeadm ?
if [ -f /etc/kubernetes/admin.conf ]; then
    echo "[INFO] kubeadm détecté"
fi

mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# 1. Est-ce que je parle bien au cluster ?
kubectl version --short
kubectl cluster-info
kubectl get nodes -o wide

# 2. Je suis sur QUEL cluster / namespace ?
kubectl config get-contexts
kubectl config current-context
kubectl config view --minify --output 'jsonpath={..namespace}'; echo

# 3. Vue d’ensemble de tout ce qui tourne
kubectl get all --all-namespaces

# 4. État des pods dans les namespaces critiques
kubectl get pods -n kube-system -o wide
kubectl get pods -n default -o wide

# 5. Les objets qui gèrent les workloads
kubectl get deployments --all-namespaces
kubectl get statefulsets --all-namespaces
kubectl get daemonsets --all-namespaces

# 6. Réseau : ce qui est exposé
kubectl get svc --all-namespaces -o wide
kubectl get ingress --all-namespaces

# 7. Stockage : ce qui garde des données
kubectl get pv
kubectl get pvc --all-namespaces

# 8. Batch / automatisations
kubectl get cronjobs --all-namespaces
kubectl get jobs --all-namespaces

# 9. Problèmes récents
kubectl get events --sort-by=.lastTimestamp

```

---

## 9. Exemple concret de manifeste YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
  type: NodePort

```

```bash
kubectl apply -f web.yaml
minikube service web --url

```

---

## 10. Résumé du rôle des composants Kubernetes

| Élément | Rôle |
| --- | --- |
| **Pod** | Unité de déploiement contenant un ou plusieurs conteneurs |
| **Deployment** | Décrit l’état désiré (nombre de Pods, image, stratégie) |
| **Service** | IP stable + load balancing entre Pods |
| **Ingress** | Routage HTTP/HTTPS depuis l’extérieur |
| **ConfigMap / Secret** | Configurations et mots de passe injectés |
| **Namespace** | Isolation logique d’environnements |
| **ReplicaSet** | Garantit un nombre fixe de Pods identiques |
| **Job / CronJob** | Tâche ponctuelle ou planifiée |
| **PersistentVolume (PV)** | Stockage physique disponible |
| **PersistentVolumeClaim (PVC)** | Demande de stockage par un Pod |

---

## 11. En résumé — La philosophie Kubernetes

> “Décris l’état voulu, et laisse Kubernetes s’assurer qu’il est respecté.”
> 

Tu n’exécutes plus manuellement des conteneurs.

Tu **décris** ton infrastructure, et Kubernetes :

- crée les objets,
- les relie entre eux,
- les surveille,
- les redémarre ou les déplace si besoin.

C’est un **chef d’orchestre** complet, conçu pour :

- la **production à grande échelle**,
- la **fiabilité**,
- et la **résilience automatique**.
