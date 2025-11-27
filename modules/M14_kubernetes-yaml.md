---
layout: page
title: Kubernetes avancés
sujet: Orchestration
type: module
jour: 14
ordre: 1
tags: kubernetes, kubectl, yaml
---

# 🧠 Kubernetes Avancé (Jour 2)

Comprendre vraiment les objets et les manifests YAML

---

## 0. Rappel : comment Kubernetes lit un fichier YAML

Quand tu fais :

```bash
kubectl apply -f monfichier.yaml

```

Kubernetes lit le YAML et voit 4 choses essentielles :

1. **apiVersion**
    
    → Quelle version de l’API Kubernetes doit traiter cet objet.
    
    Exemple : `v1`, `apps/v1`, `batch/v1`…
    
    (Chaque groupe d’objets est géré par un “groupe d’API”.)
    
2. **kind**
    
    → Quel type d’objet tu veux créer.
    
    Exemple : `Pod`, `Deployment`, `Service`, `Secret`, etc.
    
3. **metadata**
    
    → L’identité de l’objet : nom, labels, namespace.
    
4. **spec**
    
    → Le “plan de construction”.
    
    C’est l’état désiré. Ce que TU veux.
    
    Kubernetes essaie ensuite de le faire respecter.
    

💡 Très important :

Le contenu exact de `spec` dépend du type d’objet (`kind`).

Un `Pod` n’a pas la même `spec` qu’un `Deployment`, parce qu’ils ne décrivent pas la même chose.

C’est pour ça que tu vois des `spec` imbriqués : un objet peut décrire un autre objet à l’intérieur, et chacun a sa propre `spec`.

On va le voir concrètement.

---

## 1. Pod

### Qu’est-ce qu’un Pod ?

Un **Pod** est l’unité d’exécution minimale dans Kubernetes.

C’est là où tes conteneurs tournent réellement.

Un Pod peut contenir :

- 1 conteneur (cas le plus courant),
- ou plusieurs conteneurs qui travaillent ensemble (sidecar, agent, etc.).

Un Pod est **éphémère** : s’il meurt, Kubernetes peut le recréer… mais ce ne sera pas “le même”, ce sera un nouveau Pod du même modèle.

---

### Exemple YAML de Pod simple

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-pod
  labels:
    app: web
spec:
  containers:
  - name: nginx-container
    image: nginx:latest
    ports:
    - containerPort: 80

```

### Lecture ligne par ligne

- `apiVersion: v1`
    
    → Les Pods sont gérés par l’API “core” de Kubernetes, groupe de base.
    
    Pour les Pods c’est juste `v1`.
    
- `kind: Pod`
    
    → On déclare qu’on veut créer un objet de type Pod.
    
- `metadata:`
    - `name: web-pod`
        
        Nom du Pod dans le cluster. Tu t’en serviras pour `kubectl describe pod web-pod`.
        
    - `labels:`
        - `app: web`
            
            Les labels sont des étiquettes. Ils servent plus tard pour faire du ciblage.
            
            Par exemple, un Service pourra dire : “envoie le trafic à tous les Pods qui ont `app=web`”.
            
- `spec:`
    
    → Voilà l’état désiré de CE pod.
    
    - `containers:`
        
        → Liste des conteneurs dans ce Pod.
        
        - `name: nginx-container`
            
            Nom logique du conteneur.
            
        - `image: nginx:latest`
            
            L’image Docker/OCI à exécuter.
            
        - `ports:`
            - `containerPort: 80`
                
                Le port exposé DANS le Pod.
                

💡 Ici, il n’y a qu’un seul `spec`, parce que le Pod est la ressource finale : pas besoin d’aller plus loin.

---

## 2. Deployment

### C’est quoi un Deployment ?

Un **Deployment** gère la vie d’un groupe de Pods identiques :

- combien d’instances doivent tourner en parallèle,
- comment les mettre à jour sans coupure (rolling update),
- comment revenir en arrière (rollback).

Le Deployment ne lance pas les Pods directement.

Il gère un objet sous-jacent qui s’appelle ReplicaSet, qui lui gère les Pods.

Donc tu vas voir des `spec` imbriqués : Deployment → ReplicaSet → Pod.

---

### Exemple YAML de Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx-container
        image: nginx:1.27
        ports:
        - containerPort: 80

```

### Lecture ligne par ligne

- `apiVersion: apps/v1`
    
    → Les Deployments sont gérés par le groupe d’API `apps`.
    
    Pas par `v1`. Donc `apps/v1`.
    
    (C’est historique : les objets plus “évolués” vivent souvent dans des groupes API spécialisés.)
    
- `kind: Deployment`
    
    → Tu demandes un objet de type Deployment.
    
- `metadata:`
    - `name: web-deployment`
        
        → Nom du Deployment.
        
    - `labels:`
        
        → Labels du Deployment lui-même (souvent utilisé pour organisation, pas pour le trafic).
        
- `spec:`
    
    → C’est LA définition de l’état désiré du Deployment.
    
    - `replicas: 3`
        
        → Tu veux 3 Pods identiques en même temps.
        
    - `selector:`
        
        ```yaml
        selector:
          matchLabels:
            app: web
        
        ```
        
        → Le Deployment doit savoir “quels Pods sont à moi ?”.
        
        Il utilise ce sélecteur pour faire le lien :
        
        tous les Pods qui ont `app: web` sont considérés comme gérés par ce Deployment.
        
        ⚠️ si tu changes ça sans changer les labels des Pods dans le template, c’est le chaos.
        
    - `template:`
        
        → Et voilà le moment important.
        
        Le Deployment décrit le modèle (= template) du Pod qu’il va créer.
        
        C’EST ICI qu’on retrouve un **autre objet de type Pod**, imbriqué.
        
        - `metadata:`
            - `labels: app: web`
                
                C’est capital : ça doit matcher `selector.matchLabels`.
                
                Sinon le Deployment ne “reconnaît” pas ses propres Pods.
                
        - `spec:`
            
            → Maintenant on est dans la `spec` du **Pod** qui sera créé.
            
            C’est la même logique que dans la ressource Pod précédente :
            
            - conteneurs
            - image
            - ports

🧠 Pourquoi on a `spec` dans une `spec` ?

- Le `spec` du **Deployment** explique comment on gère l’ensemble (scaling, sélection, template).
- Le `spec` du `template` explique à quoi ressemble CHAQUE Pod concrètement.

Tu peux lire comme :

> “Je veux 3 Pods. Voilà à quoi doit ressembler chaque Pod.”
> 

---

## 3. ReplicaSet

### C’est quoi ?

Un **ReplicaSet** garantit “il doit toujours y avoir N Pods qui tournent”.

Il surveille et recrée si besoin.

En vrai :

- Tu n’écris presque jamais un ReplicaSet à la main.
- Le Deployment crée le ReplicaSet pour toi.
- Le ReplicaSet crée les Pods.

Mais pédagogiquement, on va le lire.

---

### Exemple YAML de ReplicaSet

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: web-replicaset
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx-container
        image: nginx:1.27
        ports:
        - containerPort: 80

```

C’est très proche du Deployment, sauf :

- Il n’y a PAS de stratégie de mise à jour (pas de rolling update).
- Il ne gère pas l’historique/rollback.
- Il répète juste : “3 Pods, pareil, toujours”.

💡 Retiens :

**Deployment = ReplicaSet + Stratégie de déploiement.**

---

## 4. StatefulSet

### Pourquoi ça existe ?

`Deployment` est parfait pour des applis sans état (stateless).

Mais pour une base de données ?

Tu veux que :

- chaque instance garde son identité,
- les noms ne bougent pas,
- les volumes restent associés à la bonne instance.

C’est le rôle du **StatefulSet** :

- identités stables (`pod-0`, `pod-1`, …),
- ordre de démarrage contrôlé,
- stockage persistant attaché par Pod.

---

### Exemple YAML de StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: "db-service"
  replicas: 2
  selector:
    matchLabels:
      app: mydb
  template:
    metadata:
      labels:
        app: mydb
    spec:
      containers:
      - name: postgres
        image: postgres:16
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 5Gi

```

### Lecture ligne par ligne

- `apiVersion: apps/v1`
    
    StatefulSet fait partie du groupe `apps`.
    
- `kind: StatefulSet`
    
    OK.
    
- `metadata.name: db`
    
    Le nom du StatefulSet.
    
- `spec.serviceName: "db-service"`
    
    Important : les Pods vont être accessibles via un Service “headless” interne.
    
    Chaque Pod aura un DNS stable basé sur ce service.
    
- `replicas: 2`
    
    On veut 2 Pods : `db-0`, `db-1`.
    
- `selector.matchLabels / template.metadata.labels`
    
    Même logique qu’avec le Deployment : il faut que ça matche.
    
- `template.spec.containers`
    
    Là c’est le Pod modèle : comme avant.
    
- `volumeMounts`
    
    Le conteneur monte un volume nommé `data` dans `/var/lib/postgresql/data`.
    
- `volumeClaimTemplates:`
    
    Cette section est **spécifique au StatefulSet**.
    
    Kubernetes va créer un PVC INDIVIDUEL par Pod, par exemple :
    
    - `data-db-0`
    - `data-db-1`

Ça garantit que `db-0` garde SES données même si le Pod est redéployé ailleurs.

---

## 5. DaemonSet

### Pourquoi ?

Un **DaemonSet** dit à Kubernetes :

> “Ce Pod doit tourner sur CHAQUE nœud du cluster.”
> 

Cas typiques :

- Agent de logs,
- Agent de monitoring,
- Outil réseau.

---

### Exemple YAML de DaemonSet

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-logger
spec:
  selector:
    matchLabels:
      app: logger
  template:
    metadata:
      labels:
        app: logger
    spec:
      containers:
      - name: log-agent
        image: my-logger:latest
        resources:
          limits:
            cpu: "100m"
            memory: "128Mi"

```

### Lecture

- `apiVersion: apps/v1`, `kind: DaemonSet`
- Pas de `replicas` ici.
    
    → Parce que le nombre de Pods dépend du nombre de nœuds du cluster, pas d’un chiffre que tu choisis.
    
- `template.spec.containers...`
    
    Le Pod modèle à lancer sur chaque nœud.
    

🧠 Ajout automatique :

- Tu ajoutes un nouveau nœud au cluster → Kubernetes déploie automatiquement ce Pod sur le nouveau nœud.
- Tu retires un nœud → le Pod part avec.

---

## 6. Service

### Pourquoi un Service ?

Les Pods ont des IPs qui changent tout le temps (ils meurent, reviennent, etc.).

Un **Service** fournit une **adresse stable** et fait du **load balancing** vers les Pods qui matchent certains labels.

---

### Exemple YAML de Service NodePort

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: NodePort
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080

```

### Lecture

- `apiVersion: v1`
    
    Les Services sont dans l’API core → `v1`.
    
- `kind: Service`
- `metadata.name: web-service`
- `spec.type: NodePort`
    
    → On expose le service sur un port ouvert de chaque nœud du cluster.
    
    Utile pour tester depuis l’extérieur en labo/minikube.
    
- `selector.app: web`
    
    → “Envoie le trafic vers les Pods qui ont le label `app=web`.”
    
    C’est là que les labels deviennent vitaux.
    
- `ports:`
    - `port: 80`
        
        Le port du Service (ce que les autres Pods du cluster vont viser).
        
    - `targetPort: 80`
        
        Le port à l’intérieur du Pod.
        
    - `nodePort: 30080`
        
        Le port ouvert sur les nœuds pour accès externe.
        

---

### Les 3 types principaux de Service

| Type | Utilisation |
| --- | --- |
| `ClusterIP` | Interne au cluster uniquement (par défaut) |
| `NodePort` | Expose via un port sur chaque nœud |
| `LoadBalancer` | S’intègre à un load balancer cloud public / externe |

---

## 7. Ingress

### À quoi ça sert ?

Un **Ingress** gère le **routage HTTP/HTTPS** vers différents Services internes.

Il permet aussi :

- la gestion des noms de domaine,
- le HTTPS (TLS),
- les chemins `/api`, `/front`, etc.

Il travaille AVEC un **Ingress Controller** (par exemple Nginx ou Traefik).

---

### Exemple YAML d’Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  rules:
  - host: myapp.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80

```

### Lecture

- `apiVersion: networking.k8s.io/v1`
    
    → L’ingress appartient au groupe API `networking.k8s.io`.
    
- `kind: Ingress`
- `spec.rules`
    
    Liste des règles de routage.
    
    - `host: myapp.local`
        
        Nom de domaine attendu dans la requête.
        
    - `paths:`
        - `path: /`
            
            Toutes les requêtes sur `/` (et sous-chemins avec `Prefix`)…
            
        - `backend.service.name: web-service`
            
            … sont envoyées vers le Service `web-service`.
            

💡 Donc :

Client → Ingress → Service → Pods.

---

## 8. ConfigMap

### Rôle

Un **ConfigMap** stocke de la configuration NON SENSIBLE (clé/valeur).

But : ne pas re-builder l’image juste pour changer une variable.

---

### YAML d’un ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_MODE: "production"
  NGINX_VERSION: "1.2.4"

```

### Injection dans un Pod (extrait)

```yaml
env:
- name: APP_MODE
  valueFrom:
    configMapKeyRef:
      name: app-config
      key: APP_MODE

```

### Lecture

- `data:`
    
    C’est un dictionnaire clé → valeur (tout en texte).
    
- Ensuite tu peux injecter ces valeurs dans le Pod via `env.valueFrom.configMapKeyRef`.

---

## 9. Secret

### Rôle

Un **Secret** stocke des valeurs sensibles (mots de passe, tokens).

Même principe qu’un ConfigMap, mais sécurisé.

---

### YAML d’un Secret (type générique)

⚠ Les valeurs sont encodées en base64 dans les manifests classiques.

(ce n’est PAS un vrai chiffrement, c’est juste pour ne pas les afficher en clair)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  DB_USER: ZGV2ZWxvcGVy
  DB_PASSWORD: c2VjcmV0MTIz

```

Ici :

- `ZGV2ZWxvcGVy` = "developer" encodé base64
- `c2VjcmV0MTIz` = "secret123" encodé base64

Injection dans un Pod :

```yaml
env:
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:
      name: db-secret
      key: DB_PASSWORD

```

---

## 10. Volumes persistants : PV & PVC

### Idée

- **PV (PersistentVolume)** : ressource de stockage dispo dans le cluster (disque, NFS, cloud disk…).
- **PVC (PersistentVolumeClaim)** : demande de stockage faite par une appli.

Le Pod ne demande pas “donne-moi ce disque-là”, il dit “j’ai besoin de 5Go en lecture-écriture”, et Kubernetes fait l’association.

---

### Exemple PV + PVC

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data
spec:
  capacity:
    storage: 10Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /data/db
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-data
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi

```

### Lecture

- PV :
    - `capacity.storage: 10Gi` → taille dispo
    - `hostPath.path: /data/db` → où ça vit physiquement (ici: stockage local du nœud, pas pour la prod mais utile en labo)
- PVC :
    - `requests.storage: 5Gi` → “je veux 5 Go”
    - Kubernetes va essayer d’attacher ce PVC à un PV compatible.

Ensuite dans ton Pod :

```yaml
volumes:
- name: data
  persistentVolumeClaim:
    claimName: pvc-data

```

---

## 11. Jobs et CronJobs

### Job

Un **Job** exécute une tâche et doit aller jusqu’au bout (ex: migration DB, génération d’un rapport).

Quand c’est terminé avec succès, c’est fini.

### CronJob

Un **CronJob** lance des Jobs régulièrement (toutes les heures, tous les jours à 03:00, etc.), comme `cron` en Linux.

---

### Exemple CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup-job
spec:
  schedule: "0 3 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cleaner
            image: alpine
            command: ["sh", "-c", "echo Nettoyage terminé"]
          restartPolicy: OnFailure

```

### Lecture

- `apiVersion: batch/v1`
    
    → Les Jobs/CronJobs vivent dans le groupe d’API `batch`.
    
- `kind: CronJob`
- `spec.schedule: "0 3 * * *"`
    
    → Syntaxe cron : ici, tous les jours à 03h00.
    
- `jobTemplate:`
    
    → Modèle du Pod qui sera lancé à chaque exécution planifiée.
    
- `restartPolicy: OnFailure`
    
    → Si ça échoue, réessaie.
    

---

## 12. HPA (Horizontal Pod Autoscaler)

### Rôle

L’HPA ajuste le nombre de Pods automatiquement selon l’usage CPU/mémoire.

Exemple : si la charge CPU dépasse 80%, passe de 3 Pods à 6 Pods.

Si la charge redescend, reviens à 3 Pods.

---

### Exemple YAML d’HPA (classique basé CPU)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-deployment
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80

```

### Lecture

- `apiVersion: autoscaling/v2`
    
    → Les HPA vivent dans le groupe d’API `autoscaling`.
    
- `scaleTargetRef`
    
    → À quoi on applique l’auto-scale ?
    
    Ici : le Deployment `web-deployment`.
    
- `minReplicas` / `maxReplicas`
    
    → Fourchette autorisée.
    
- `averageUtilization: 80`
    
    → Si l’utilisation CPU moyenne par Pod dépasse 80%, on scale OUT.
    

🧠 Ce mécanisme = scalabilité automatique sans intervention humaine.

---

## 13. Récap visuel : qui fait quoi ?

| Objet | API Version | Rôle principal |
| --- | --- | --- |
| Pod | v1 | Conteneur(s) en exécution réelle |
| Deployment | apps/v1 | Gère le déploiement, le rollout, le rollback, le scaling |
| ReplicaSet | apps/v1 | Maintient le bon nombre de Pods |
| StatefulSet | apps/v1 | Pods à identité stable + stockage par instance |
| DaemonSet | apps/v1 | Un Pod par nœud (logs, monitoring, réseau) |
| Service | v1 | IP stable + load balancing entre Pods |
| Ingress | networking.k8s.io/v1 | Routage HTTP/HTTPS et domaines externes |
| ConfigMap | v1 | Variables non sensibles (clé/valeur) |
| Secret | v1 | Secrets chiffrés/base64, mots de passe, tokens |
| PersistentVolume | v1 | Ressource de stockage physique disponible |
| PVC | v1 | Demande de stockage par une appli |
| Job / CronJob | batch/v1 | Tâches ponctuelles ou récurrentes |
| HPA | autoscaling/v2 | Auto-scale horizontal selon la charge |