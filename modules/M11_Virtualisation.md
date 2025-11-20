---
titre: La virtualisation
type: module
jour: 11
ordre: 1
tags: virtualisation, devops
---

# 🧠 Cours complet : La Virtualisation et ses principes

## 1. Introduction à la virtualisation

La **virtualisation** est une technologie qui permet de créer plusieurs environnements isolés sur une même machine physique.

Autrement dit, **on fait croire à plusieurs systèmes qu’ils disposent de leur propre matériel**, alors qu’ils partagent tous les mêmes ressources physiques (processeur, mémoire, stockage, carte réseau…).

### Exemple concret

Tu as un ordinateur physique (ton hôte).

Dedans, tu peux créer :

- une machine virtuelle **Debian** pour héberger un serveur web,
- une machine virtuelle **Windows Server** pour tester une application métier,
- une machine virtuelle **Kali Linux** pour faire du pentesting.

Ces machines fonctionnent comme des ordinateurs indépendants, tout en utilisant la même machine réelle.

---

## 2. Objectifs et avantages de la virtualisation

### 2.1 Isolation

Chaque machine virtuelle (VM) fonctionne indépendamment :

- Si l’une plante ou est infectée, les autres continuent à fonctionner.
- Tu peux tester sans impacter ton environnement principal.

### 2.2 Réplication et flexibilité

Tu peux cloner ou sauvegarder une VM facilement pour :

- créer un environnement de test identique à la production,
- restaurer un système après une erreur,
- déployer plusieurs serveurs identiques rapidement.

### 2.3 Optimisation des ressources

Sans virtualisation, un serveur physique est souvent utilisé à 10–20 % de ses capacités.

Avec la virtualisation, tu peux héberger plusieurs systèmes dessus, et donc mieux exploiter le matériel.

### 2.4 Sécurité et séparation des environnements

En entreprise, on distingue souvent :

- **Dev** : environnement de développement
- **Preprod** : pour valider les changements
- **Prod** : environnement final utilisé par les clients

La virtualisation permet d’isoler ces espaces de manière propre et sécurisée.

---

## 3. Architecture d’un environnement virtualisé

Une architecture classique se décompose en plusieurs couches :

| Niveau | Élément | Rôle |
| --- | --- | --- |
| 0 | Matériel physique | CPU, RAM, stockage, réseau |
| 1 | **Hyperviseur** | Logiciel qui distribue les ressources matérielles |
| 2 | **Machines virtuelles (VM)** | Systèmes d’exploitation invités |
| 3 | Applications | Programmes installés dans les VM |

L’**hyperviseur** est donc la pièce maîtresse : il permet de créer, gérer et isoler les machines virtuelles.

---

## 4. Les différents types de virtualisation

La virtualisation ne concerne pas que les systèmes d’exploitation.

On distingue plusieurs **familles de virtualisation**, chacune répondant à un besoin précis.

### 4.1 Tableau récapitulatif

| Type de virtualisation | Description | Outils / Exemples | Avantages | Limites |
| --- | --- | --- | --- | --- |
| **Virtualisation complète** | Chaque VM simule un ordinateur complet (OS invité indépendant). | VMware ESXi, Hyper-V, VirtualBox, KVM | Compatibilité totale, isolation forte | Consomme beaucoup de ressources |
| **Paravirtualisation** | L’OS invité coopère avec l’hyperviseur via des pilotes spéciaux. | Xen, VirtIO | Meilleures performances, moins de surcharge | L’OS invité doit être compatible |
| **Virtualisation de conteneurs** | Plusieurs applications partagent le même noyau du système hôte. | Docker, LXC, Podman, Kubernetes | Très léger et rapide, idéal microservices | Moins isolé (partage du noyau) |
| **Virtualisation du stockage** | Mutualise plusieurs disques physiques en volumes logiques. | LVM, ZFS, Ceph | Meilleure résilience, snapshots, flexibilité | Complexité de configuration |
| **Virtualisation réseau** | Simule des réseaux, routeurs et pare-feu virtuels. | vSwitch, VLAN, VXLAN, SDN | Isolation réseau, topologies simulées | Nécessite une bonne maîtrise réseau |

---

## 5. Les hyperviseurs

L’hyperviseur est le logiciel (ou le mini-système) qui gère la virtualisation.

Il contrôle les ressources physiques et permet aux VM de les utiliser.

### 5.1 Hyperviseur de type 1 (Bare Metal)

- Installé **directement sur le matériel**.
- Pas d’OS hôte entre le matériel et l’hyperviseur.
- Utilisé en **datacenter et production**.

**Exemples :** VMware ESXi, Microsoft Hyper-V Server, Xen, Proxmox, KVM.

**Avantages :**

- Performances optimales.
- Stabilité et haute disponibilité.

**Inconvénients :**

- Nécessite du matériel dédié et une administration plus technique.

### 5.2 Hyperviseur de type 2 (Hosted)

- Installé **au-dessus d’un système d’exploitation**.
- Utilisé surtout pour les **tests et environnements personnels**.

**Exemples :** VirtualBox, VMware Workstation, Parallels, Hyper-V Desktop.

**Avantages :**

- Simplicité d’installation.
- Parfait pour le labo et la formation.

**Inconvénients :**

- Moins performant (le système hôte consomme déjà des ressources).

---

## 6. Les machines virtuelles (VM)

Une **machine virtuelle** est un ordinateur simulé.

Elle dispose :

- de son propre disque dur virtuel (fichier .vdi, .vmdk, etc.),
- de sa propre mémoire RAM virtuelle,
- de sa propre carte réseau virtuelle.

Dans une VM, tu peux installer **n’importe quel système d’exploitation** (Windows, Linux, BSD, etc.).

Elle démarre et fonctionne comme un PC réel.

### 6.1 Snapshots et clones

- **Snapshot** : une “photo” instantanée d’une VM. Tu peux y revenir en cas d’erreur.
- **Clone** : une copie complète d’une VM.
- **Template** : une VM préconfigurée servant de modèle pour de nouveaux déploiements.

---

## 7. La conteneurisation (Docker & co)

La conteneurisation est une **forme légère de virtualisation** centrée sur les **applications**, pas sur le système complet.

### 7.1 Principe

Les conteneurs partagent le **même noyau** que la machine hôte, mais chacun dispose :

- de son espace isolé de fichiers,
- de ses processus indépendants,
- de ses variables et configurations propres.

### 7.2 Outils principaux

- **Docker** : crée et exécute des conteneurs.
- **Docker Compose** : décrit des ensembles de conteneurs liés (app + base de données + cache).
- **Kubernetes** : orchestre et gère des centaines de conteneurs à l’échelle.

### 7.3 Avantages

- Légèreté (démarre en quelques secondes).
- Facile à déployer et à mettre à jour.
- Idéal pour les architectures microservices.

### 7.4 Limites

- Moins d’isolation qu’une VM complète.
- Partage du même noyau = dépendance au système hôte.
- Nécessite une bonne gestion réseau et sécurité.

---

## 8. Comparaison entre VM et conteneurs

| Critère | Machine virtuelle | Conteneur |
| --- | --- | --- |
| **Isolation** | Très forte (OS complet) | Moyenne (partage du noyau) |
| **Poids** | Lourd (plusieurs Go) | Léger (quelques centaines de Mo) |
| **Vitesse de démarrage** | Lente (plusieurs secondes/minutes) | Instantanée (moins d’une seconde) |
| **Usage typique** | Simuler un serveur complet, isoler un OS | Exécuter une application ou un service |
| **Gestion** | Hyperviseur (VMware, VirtualBox) | Docker / Kubernetes |
| **Sécurité** | Très isolé, idéal pour environnements critiques | Suffisant pour applications cloud |

---

## 9. Autres formes de virtualisation

### 9.1 Virtualisation du stockage

- Permet de combiner plusieurs disques ou serveurs de stockage en un espace logique unique.
- Technologies : RAID, LVM, ZFS, Ceph.
- Avantage : continuité de service et gestion simplifiée de l’espace disque.

### 9.2 Virtualisation réseau

- Permet de créer des réseaux virtuels indépendants.
- Utilisé pour isoler la production, les sauvegardes, les tests…
- Outils : VLAN, vSwitch, SDN (Software Defined Networking).

---

## 10. Virtualisation et sécurité

### 10.1 Points positifs

- Isolation des environnements : une attaque reste confinée à une VM.
- Restauration rapide via snapshots.
- Facilité de test et sandboxing (tests sans risque pour le système réel).

### 10.2 Risques

- Mauvaise configuration réseau (VM non isolée).
- Trop de VM non maintenues (« VM orphelines »).
- Vulnérabilités dans les hyperviseurs ou les conteneurs mal sécurisés.

---

## 11. Cas d’usages typiques

### Pour un développeur

- Créer un environnement isolé pour chaque projet.
- Tester plusieurs OS sans redémarrer.

### Pour un administrateur système

- Mutualiser les serveurs.
- Isoler les rôles (web, base de données, mail, sauvegarde).

### Pour un DevOps

- Exécuter Docker/Kubernetes dans des VM.
- Automatiser le déploiement complet de l’infrastructure.

### Pour la sécurité

- Simuler des réseaux ou serveurs vulnérables (lab de test).
- Étudier les comportements malveillants sans risquer la machine réelle.

---

## 12. Conclusion

La **virtualisation** est devenue la base de toute infrastructure moderne.

Elle permet :

- d’optimiser les ressources physiques,
- d’isoler les environnements,
- de tester sans danger,
- de déployer des architectures complexes sur une seule machine.

Aujourd’hui, la **virtualisation et la conteneurisation** ne s’opposent pas : elles se complètent.

Une architecture typique moderne ressemble à ceci :

> Matériel physique → Hyperviseur → VM Linux → Docker / Kubernetes → Conteneurs applicatifs
>

---
[Module suivant →](M11_dockers.md)
---
