# 🎬 TP NestJS Machine - Robin FAUCHERY 5IW3

## 📝 Description

Application NestJS complète de gestion de films avec système d'authentification avancé et watchlist personnalisée.

### ✨ Fonctionnalités implémentées

- ✅ **Inscription et authentification** (JWT)
- ✅ **Validation par email** avec token de vérification
- ✅ **Authentification à 2 facteurs (2FA)** par email
- ✅ **Gestion des rôles** (USER / ADMIN)
- ✅ **Endpoints publics et privés** avec guards
- ✅ **Contrôle d'accès par rôle**
- ✅ **Ressources limitées spécifiques à l'utilisateur** (watchlist personnelle)
- ✅ **Documentation Swagger** complète
- ✅ **DTOs** avec validation

## 🚀 Installation et lancement

### Prérequis
- Node.js (v18+)
- Docker & Docker Compose
- npm ou yarn

### 1. Cloner le projet
```bash
git clone <repository-url>
cd nest-tp-machine-robin-fauchery-5iw3
```

### 2. Configuration
Copier le fichier d'environnement :
```bash
cp .env.example .env
```

Configurer les variables dans `.env` :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/app"
JWT_SECRET="your-super-secret-jwt-key"
EMAIL_FROM="noreply@example.com"
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-password"
```

### 3. Démarrage complet
```bash
# 1. Lancer la base de données
docker compose up -d

# 2. Installer les dépendances
npm install

# 3. Synchroniser la base de données
npx prisma db push

# 4. Générer le client Prisma
npx prisma generate

# 5. Lancer l'application
npm run start:dev
```

### 4. Accès
- **API** : http://localhost:3000
- **Documentation Swagger** : http://localhost:3000/api
- **Base de données** : PostgreSQL sur le port 5432
- **Maildev** : http://localhost:1080

## 🏗️ Architecture

```
src/
├── auth/           # Authentification, 2FA, vérification email
├── users/          # Gestion des utilisateurs (CRUD admin)
├── movies/         # Gestion des films et watchlists
├── mail/           # Service d'envoi d'emails
└── shared/         # Guards, decorators, DTOs partagés
```

## 📋 Endpoints principaux

### 🔐 Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/verify-2fa` - Validation 2FA
- `GET /auth/verify-email` - Vérification email

### 👥 Utilisateurs (Admin uniquement)
- `GET /users` - Liste des utilisateurs
- `POST /users` - Créer un utilisateur
- `PATCH /users/:id` - Modifier un utilisateur
- `DELETE /users/:id` - Supprimer un utilisateur

### 🎬 Films
#### Publics
- `GET /movies` - Catalogue complet
- `GET /movies/:id` - Détails d'un film

#### Admin
- `POST /movies` - Ajouter un film
- `PATCH /movies/:id` - Modifier un film
- `DELETE /movies/:id` - Supprimer un film

#### Watchlist personnelle
- `GET /movies/watchlist/my` - Ma watchlist uniquement
- `GET /movies/watchlist/all` - Tous les films + mon statut
- `POST /movies/:id/watchlist` - Ajouter à ma watchlist
- `PATCH /movies/:id/watchlist/status` - Changer mon statut
- `DELETE /movies/:id/watchlist` - Retirer de ma watchlist

## 🔑 Système de permissions

| Rôle | Accès |
|------|-------|
| **Public** | Consulter le catalogue de films |
| **USER** | Gérer sa watchlist personnelle |
| **ADMIN** | Gérer les utilisateurs et le catalogue |

## 🛡️ Sécurité

- **JWT** pour l'authentification
- **2FA obligatoire** pour la connexion
- **Vérification email** requise pour certaines actions
- **Guards** pour protéger les routes
- **Validation** des données avec class-validator
- **Hashage** des mots de passe avec bcrypt

## 🗄️ Base de données

Modèles Prisma :
- `User` - Utilisateurs avec rôles
- `Movie` - Catalogue de films
- `UserMovie` - Relation many-to-many pour les watchlists
- `EmailVerification` - Tokens de vérification email
- `TwoFactorCode` - Codes 2FA temporaires

## 📚 Documentation API

La documentation complète est disponible sur Swagger :
👉 **http://localhost:3000/api**
