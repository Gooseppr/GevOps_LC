---
module: Vagrant — bases utiles
jour: 01
ordre: 1
---

# Vagrant — bases utiles (cours)

- **Vagrant** automatise la création/configuration de VMs.
- **Box** : image préconfigurée (modèle) ; **provider** : virtualiseur (VirtualBox, etc.)
- Commandes clés :
    - `vagrant init <box>` → crée `Vagrantfile`
    - `set VAGRANT_VAGRANTFILE=Vagrantfile.amd64` → définit le choix du `Vagrantfile`
    - `vagrant up` → démarre/crée la VM
    - `vagrant ssh` → se connecter en SSH
    - `vagrant halt` → éteindre
    - `vagrant destroy` → supprimer la VM
- Accès SSH typique : `127.0.0.1:2222`
- Ex. : `vagrant destroy 1a2b3c4d` (détruit la VM d’ID partiel)
    
    ---
    

---

---
[Module suivant →](001_terminal-bash.md)
---
