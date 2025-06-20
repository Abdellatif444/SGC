# 🎓 SGC - Système de Gestion Scolaire

Un système de gestion scolaire moderne développé avec Angular 19 et Django 4.2, offrant une interface intuitive pour la gestion des étudiants, des enseignants, des cours et des évaluations.

## 🚀 Fonctionnalités

- **Gestion des étudiants** : Inscription, suivi académique, historique
- **Gestion des enseignants** : Profils, affectations de cours
- **Gestion des cours** : Planning, matières, horaires
- **Système d'évaluation** : Notes, bulletins, rapports
- **Interface moderne** : Design responsive avec Bootstrap et Tailwind CSS
- **API REST** : Backend Django avec authentification JWT
- **Base de données** : PostgreSQL pour la production

## 🛠️ Technologies utilisées

### Frontend
- **Angular 19** - Framework frontend
- **Bootstrap 5.3** - Framework CSS
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **FontAwesome** - Icônes
- **RxJS** - Programmation réactive

### Backend
- **Django 4.2** - Framework web Python
- **Django REST Framework** - API REST
- **Django CORS Headers** - Gestion CORS
- **Simple JWT** - Authentification par tokens
- **Channels** - WebSockets pour temps réel
- **PostgreSQL** - Base de données

### DevOps
- **Docker & Docker Compose** - Containerisation
- **PostgreSQL** - Base de données de production

## 📋 Prérequis

- **Node.js** (version 18 ou supérieure)
- **Python** (version 3.8 ou supérieure)
- **Docker** et **Docker Compose**
- **Git**

## 🚀 Installation et démarrage

### Option 1 : Avec Docker (Recommandé)

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/SGC.git
   cd SGC
   ```

2. **Lancer avec Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Accéder à l'application**
   - Frontend : http://localhost:4200
   - Backend API : http://localhost:8000
   - Base de données : localhost:5432

### Option 2 : Installation manuelle

#### Backend Django

1. **Créer un environnement virtuel**
   ```bash
   cd back-end
   python -m venv env
   # Windows
   env\Scripts\activate
   # Linux/Mac
   source env/bin/activate
   ```

2. **Installer les dépendances**
   ```bash
   pip install -r requirements.txt.txt
   ```

3. **Configurer la base de données**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Créer un superutilisateur**
   ```bash
   python manage.py createsuperuser
   ```

5. **Lancer le serveur**
   ```bash
   python manage.py runserver
   ```

#### Frontend Angular

1. **Installer les dépendances**
   ```bash
   cd front-end/ScholarSystem
   npm install
   ```

2. **Lancer le serveur de développement**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` dans le dossier `back-end/` :

```env
DEBUG=True
SECRET_KEY=votre-secret-key-ici
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/scholarsystem
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

### Configuration de la base de données

Le projet utilise PostgreSQL en production. Pour le développement local, vous pouvez utiliser SQLite ou PostgreSQL.

## 📁 Structure du projet

```
SGC/
├── front-end/
│   └── ScholarSystem/          # Application Angular
│       ├── src/
│       ├── package.json
│       └── angular.json
├── back-end/
│   ├── ScholarSystem/          # Projet Django principal
│   ├── SGC/                    # Application Django
│   ├── manage.py
│   ├── requirements.txt.txt
│   └── dockerfile
├── docker-compose.yml          # Configuration Docker
├── package.json                # Dépendances globales
└── README.md
```

## 🧪 Tests

### Tests Backend
```bash
cd back-end
python manage.py test
```

### Tests Frontend
```bash
cd front-end/ScholarSystem
npm test
```

## 🚀 Déploiement

### Production avec Docker

1. **Build des images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Lancer en production**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Variables d'environnement de production

```env
DEBUG=False
SECRET_KEY=votre-secret-key-production
DATABASE_URL=postgresql://user:password@host:port/dbname
ALLOWED_HOSTS=votre-domaine.com
CORS_ALLOWED_ORIGINS=https://votre-domaine.com
```


⭐ N'oubliez pas de donner une étoile au projet si vous l'aimez ! 
