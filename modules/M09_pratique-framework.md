---
title: Backend & API
sujet: Backend
type: module
jour: 09
ordre: 2
tags: nodejs, api, devops
---

# Node.js + Express (backend)

## Installer / préparer

```bash
# Recommandé : NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v && npm -v

```

## Lancer / tester

```bash
cd /home/engineer/setup/J5/startwithnode
npm install
npm start              # lit "start" dans package.json (souvent node ./bin/www)
curl http://localhost:3000/
curl -X POST http://localhost:3000/ -H "Content-Type: application/json" -d '{"message":"Hello"}'

```

## Logs / arrêt

- Logs : ajoute `morgan('dev')` dans Express pour les requêtes.
- Arrêter : `Ctrl+C`.

## Pièges & tips

- **Ports** : 3000 par défaut ; variable `PORT=5050 npm start`.
- **Hot-reload** : `npm i -D nodemon` + script `"dev": "nodemon app.js"`.
- **.env** : `npm i dotenv` et `require('dotenv').config()`.

---

# Python + Flask

## Installer / préparer

```bash
sudo apt update
sudo apt install -y python3-pip python3-venv
cd /home/engineer/setup/J9/startwithflask
python3 -m venv venv                 # ⚠️ sans sudo
source venv/bin/activate
pip install -r requirements.txt

```

## Lancer / tester

```bash
# si fichier "hello.py"
flask --app hello run --port 5050    # http://127.0.0.1:5050
curl http://127.0.0.1:5050/
curl -X POST http://127.0.0.1:5050/ -H "Content-Type: application/json" -d '{"message":"Hello"}'

```

## Logs / arrêt

- Flask affiche les requêtes en console.
- Arrêter : `Ctrl+C`.

## Pièges & tips

- **Erreur ensurepip/venv** : `sudo apt install -y python3.11-venv` (ou `python3-venv` selon version).
- **Prod** : `pip install gunicorn` → `gunicorn -w 2 -b 0.0.0.0:5050 hello:app`.
- **.env** : `pip install python-dotenv` (auto-chargé par Flask en debug).

---

# Java + Spring Boot (Maven)

## Installer / préparer

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk maven
java -version && mvn -v
cd /home/engineer/setup/J9/startwithspring

```

## Lancer / tester

```bash
# Avec Maven installé
mvn spring-boot:run
# OU build + JAR
mvn -DskipTests package
java -jar target/*SNAPSHOT.jar

# Test
curl http://localhost:8080/
curl -X POST http://localhost:8080/ -H "Content-Type: application/json" -d '{"message":"Hello"}'

```

## Logs / arrêt

- Spring Boot logge tout (port, requêtes si filtre logback configuré).
- Arrêter : `Ctrl+C`.

## Pièges & tips

- **`spring-boot:run` sans `mvn`** → erreur : lance `mvn spring-boot:run`
- **Wrapper** : `./mvnw spring-boot:run` (si présent). Si erreur sous Linux : `chmod +x mvnw && dos2unix mvnw`.
- **Java 17+ requis** (Boot 3.x).
- **Profils** : `-spring.profiles.active=dev`.

---

# .NET / ASP.NET Core

## Installer / préparer (SDK 8 LTS)

```bash
# Debian 12 (adapte si Ubuntu)
sudo apt update && sudo apt install -y wget apt-transport-https
wget https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update && sudo apt install -y dotnet-sdk-8.0
dotnet --info
cd /home/engineer/setup/J9/startwithdotnet

```

## Lancer / tester

```bash
# Corrige TargetFramework si besoin dans *.csproj (ex: <TargetFramework>net8.0</TargetFramework>)
dotnet restore
dotnet run

curl http://localhost:5000/
curl -X POST http://localhost:5000/ -H "Content-Type: application/json" -d '{"message":"Hello"}'

```

## Logs / arrêt

- Kestrel affiche “Now listening on…”.
- Arrêter : `Ctrl+C`.

## Pièges & tips

- **NETSDK1045** : projet cible `net9.0` mais SDK 8 → soit `apt install dotnet-sdk-9.0`, soit change `<TargetFramework>net8.0</TargetFramework>`.
- **global.json** pour verrouiller la version SDK :
    
    ```bash
    dotnet --list-sdks
    dotnet new globaljson --sdk-version 8.0.4xx --force
    
    ```
    

---

# PHP + Laravel

## Installer / préparer

```bash
sudo apt update
sudo apt install -y php-cli php-common php8.2-zip php8.2-xml php8.2-curl php8.2-mbstring unzip curl git
# Composer (global, officiel)
php -r "copy('https://getcomposer.org/installer','composer-setup.php');"
HASH="$(curl -sS https://composer.github.io/installer.sig)"
php -r "if (hash_file('sha384','composer-setup.php')==='$HASH'){echo OK;}else{echo BAD;unlink('composer-setup.php');exit(1);}"; echo
sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
php -r "unlink('composer-setup.php');"
composer -V

cd /home/engineer/setup/J9/startwithlaravel
composer install
cp .env.example .env
php artisan key:generate

```

## Lancer / tester

```bash
php artisan serve --host 127.0.0.1 --port 8000
curl http://localhost:8000/
curl http://localhost:8000/api
curl -X POST http://localhost:8000/ -H "Content-Type: application/json" -d '{"message":"Hello"}'

```

## Logs / arrêt

- Logs : `storage/logs/laravel.log`
- Arrêter : `Ctrl+C`.

## Pièges & tips

- **Extensions manquantes** → installe les `php8.2-*` listées plus haut.
- **Cache** : `php artisan config:clear && php artisan cache:clear && php artisan route:clear`.
- **Migrations** (si BD) : `php artisan migrate`.

---

# Go + Gin

## Installer / préparer

```bash
# Officiel recommandé
sudo rm -rf /usr/local/go
GO_VERSION=1.23.1
curl -LO https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
echo 'export PATH=/usr/local/go/bin:$PATH' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export PATH=$GOPATH/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
go version

cd /home/engineer/setup/J9/startwithgin
# ⚠️ la directive "go" dans go.mod = MAJOR.MINOR (ex: 1.23), pas de patch !
sed -i 's/^go .*/go 1.23/' go.mod
go mod tidy

```

## Lancer / tester

```bash
go run main.go
curl http://localhost:8080/
curl -X POST http://localhost:8080/ -H "Content-Type: application/json" -d '{"message":"Hello"}'

```

## Logs / arrêt

- Gin a un logger middleware par défaut.
- Arrêter : `Ctrl+C`.

## Pièges & tips

- **`invalid go version '1.24.3'`** → mets `go 1.24` (sans patch) dans `go.mod`.
- **Hot-reload** : `go install github.com/cosmtrek/air@latest` puis `air`.

---

# Rust + Actix-Web

## Installer / préparer

```bash
sudo apt update
sudo apt install -y build-essential pkg-config libssl-dev curl
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustc --version && cargo --version

cd /home/engineer/setup/J9/startwithactix
# Cargo.toml doit contenir: actix-web = "4"
cargo fetch

```

## Lancer / tester

```bash
cargo run
curl http://127.0.0.1:8080/
curl -X POST http://127.0.0.1:8080/ -H "Content-Type: application/json" -d '{"message":"Hello"}'

```

## Logs / arrêt

- Ajoute `env_logger` pour voir les requêtes :
    
    ```toml
    # Cargo.toml
    [dependencies]
    actix-web = "4"
    env_logger = "0.11"
    log = "0.4"
    
    ```
    
    Puis dans `main.rs` :
    
    ```rust
    env_logger::init();
    
    ```
    
    Lance avec : `RUST_LOG=info cargo run`
    
- Arrêter : `Ctrl+C`.

## Pièges & tips

- **Pas de cargo** après install : `source ~/.cargo/env`.
- **OpenSSL** manquant → déjà couvert par `libssl-dev`.

---
[← Module précédent](M09_backend-API.md)
---
