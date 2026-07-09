# Documentation Plateforme de Restauration

## Demarrage

### Pre-requis
- Node.js 18+
- MongoDB (Docker) sur port 27018

### Installation

```bash
# Backend
cd backend
npm install
npx prisma generate
npm run seed     # Remplir la base avec les données de démo
npm run dev      # Serveur sur port 3001

# Frontend (autre terminal)
cd frontend
npm install
npm run dev      # Serveur sur port 5173
```

### Variables d'environnement Backend (`.env`)

```
PORT=3001
DATABASE_URL=mongodb://localhost:27018/restaurant_platform?directConnection=true
JWT_SECRET=change-me-in-production
CORS_ORIGIN=http://localhost:5173
```

---

## Comptes Seed

Exécuter `npm run seed` dans le dossier `backend/` pour initialiser la base.

| Role | Telephone | Mot de passe |
|---|---|---|
| ADMIN (proprietaire) | `770 000 00 01` | `admin123` |
| CLIENT | `770 000 00 02` | `client123` |
| LIVREUR | `770 000 00 03` | `livreur123` |
| GERANT (Le Dakar Gourmet) | `770 000 00 98` | `gerant123` |
| GERANT (Chez Mama Africa) | `770 000 00 99` | `gerant123` |

Les numeros s'ecrivent aussi avec espaces (`770 000 00 01`) – le backend les normalise automatiquement.

Données seed : 2 restaurants, 21 plats (7 catégories), 6 commandes à divers statuts, avis, réclamation, livraisons, paiements.

---

## Interface Admin

### Gestion du Menu (`/admin/menu`)
- Creation / Modification / Suppression de categories
- Creation / Modification / Suppression de plats
- Attribution a une categorie
- Prix, description, image (upload fichier ou URL)

### Inventaire (`/admin/inventory`)
- Stock en temps reel par plat
- Activation/desactivation de la disponibilite
- Carte "Livraisons en cours" avec livreur assigne
- Alerte stock bas <= 3

### Commandes (`/admin/orders`)
- Filtre par statut (tabs)
- Changement de statut (PENDING > CONFIRMED > PREPARING > READY > DELIVERED)
- Assignation d'un livreur (modal avec selection + temps estime)
- Affichage du livreur assigne dans la liste

### Livraisons (`/admin/deliveries`)
- Liste toutes les livraisons filtrees par restaurant (GERANT) ou toutes (ADMIN)
- Filtre par statut (Assignee, Ramassee, En transit, Livree)
- Cartes avec icône statut, infos restaurant/livreur/adresse

### Personnel (`/admin/staff`)
- Creation de comptes ADMIN, GERANT, LIVREUR
- Selection du restaurant pour le role GERANT
- Sélecteur de rôle graphique avec icônes

### Utilisateurs (`/admin/users`)
- Liste avec filtres par role
- Barre de recherche
- Activation/desactivation de compte

### Restaurants (`/admin/restaurants`)
- Cartes grille avec avatar lettre, zones livraison
- Edition detaillee avec categories + plats (AdminRestaurantForm)

---

## Gestion des roles

### ADMIN
- Acces complet a toutes les pages admin
- Gere les restaurants, le personnel, les utilisateurs
- Voit toutes les commandes et livraisons

### GERANT (Gerant de restaurant)
- Limite a un seul restaurant (via `managedRestaurantId`)
- Sidebar masque : Users, Staff, Restaurants
- Header affiche le nom de son restaurant
- Menu, Inventaire, Commandes, Livraisons filtres par restaurant
- Peut assigner des livreurs aux commandes

### LIVREUR
- Voit ses livraisons assignees (actives + historique complet)
- Met a jour le statut : Assignee > Ramassee > En transit > Livree
- Acces a la page `/delivery` et `/delivery/:id`

### CLIENT
- Consulte les menus publics
- Passe commande (sur place ou livraison)
- Note et reclame sur les commandes

---

## Impression de facture

Sur le detail d'une commande (`/orders/:id`), les ADMIN et GERANT ont un bouton imprimante. Le format d'impression affiche :
- En-tete du restaurant (nom, adresse, telephone)
- N de commande, date
- Tableau des articles (nom, quantite, prix)
- Frais de livraison, total
- Adresse de livraison

---

## Tests

```bash
cd backend
npx jest --forceExit
```

54 tests, 9 suites — couvre : auth, menu, orders, deliveries, reviews, complaints, users, payments/dashboard, restaurants/seed.

---

## Routes API

| Methode | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Connexion | - |
| POST | `/api/auth/register` | Inscription | - |
| GET | `/api/auth/me` | Profil | Auth |
| PATCH | `/api/auth/me` | Modifier profil | Auth |
| POST | `/api/auth/register-staff` | Creer staff | ADMIN |
| GET | `/api/restaurants` | Liste restaurants | - |
| POST | `/api/restaurants` | Creer restaurant | ADMIN |
| GET | `/api/restaurants/:id` | Detail restaurant | - |
| PUT | `/api/restaurants/:id` | Modifier restaurant | ADMIN |
| DELETE | `/api/restaurants/:id` | Supprimer restaurant | ADMIN |
| GET | `/api/menu-items` | Liste plats | - |
| POST | `/api/menu-items` | Creer plat | ADMIN/GERANT |
| PUT | `/api/menu-items/:id` | Modifier plat | ADMIN/GERANT |
| PATCH | `/api/menu-items/:id/availability` | Disponibilite | ADMIN/GERANT |
| DELETE | `/api/menu-items/:id` | Supprimer plat | ADMIN/GERANT |
| POST | `/api/categories` | Creer categorie | ADMIN/GERANT |
| DELETE | `/api/categories/:id` | Supprimer categorie | ADMIN/GERANT |
| GET | `/api/orders` | Liste commandes | Auth |
| POST | `/api/orders/on-site` | Commande sur place | Auth |
| POST | `/api/orders/remote` | Commande livraison/emporter | Auth |
| GET | `/api/orders/:id` | Detail commande | Auth |
| PATCH | `/api/orders/:id/status` | Changer statut | ADMIN/GERANT |
| POST | `/api/orders/:id/cancel` | Annuler commande | Auth |
| GET | `/api/deliveries` | Liste livraisons | ADMIN/GERANT |
| GET | `/api/deliveries/my` | Mes livraisons (livreur) | LIVREUR |
| GET | `/api/deliveries/:id` | Detail livraison | Auth |
| GET | `/api/deliveries/order/:orderId` | Livraison par commande | Auth |
| POST | `/api/deliveries/assign` | Assigner livreur | ADMIN/GERANT |
| PATCH | `/api/deliveries/:id/status` | Changer statut | LIVREUR/ADMIN |
| POST | `/api/reviews` | Creer avis | Auth |
| GET | `/api/reviews/restaurant/:restaurantId` | Avis restaurant | - |
| GET | `/api/reviews/pending` | Avis en attente | ADMIN/GERANT |
| PATCH | `/api/reviews/:id/moderate` | Moderer avis | ADMIN/GERANT |
| POST | `/api/complaints` | Creer reclamation | Auth |
| GET | `/api/complaints` | Liste reclamations | ADMIN/GERANT |
| PATCH | `/api/complaints/:id/status` | Traiter reclamation | ADMIN/GERANT |
| GET | `/api/users` | Liste utilisateurs | ADMIN/GERANT |
| PATCH | `/api/users/:id/toggle` | Activer/desactiver | ADMIN |
| GET | `/api/dashboard/sales` | Ventes | ADMIN/GERANT |
| GET | `/api/dashboard/top-items` | Top plats | ADMIN/GERANT |
| GET | `/api/dashboard/cancellations` | Annulations | ADMIN/GERANT |
| GET | `/api/dashboard/delivery-times` | Temps livraison | ADMIN/GERANT |
| POST | `/api/upload` | Upload image | ADMIN/GERANT |
| PATCH | `/api/menu-items/:id/toggle` | Toggle disponibilite | ADMIN/GERANT |

---

## Fonctionnalites

- **Dark mode** : bouton lune/soleil, classe `.dark` sur `<html>`, CSS variables
- **Responsive** : header hamburger mobile, sidebar overlay mobile (AdminLayout), tableaux scrollables
- **Multi-restaurant** : proprietaire (`ownerId`), filtre par restaurant pour GERANT
- **Roles** : ADMIN, GERANT, LIVREUR, CLIENT avec restrictions adaptées
- **Gestion de stock** et inventaire temps réel
- **Assignation de livreur** aux commandes
- **Suivi de livraison** (socket.io)
- **Impression de facture**
- **Avis et reclamations** avec modération
- **Dashboard** : ventes, top plats, annulations, temps livraison
- **Login rapide** : boutons démo avec pré-remplissage des identifiants
- **Design modernisé** : gradients, ombres, animations (fade-in, scale-in, shimmer), glassmorphism
- **ImageUpload** : support upload fichier + saisie URL

---

## Architecture

```
restaurant-platform/
├── backend/
│   ├── prisma/          # Schéma + seed
│   ├── src/
│   │   ├── config/      # Prisma, multer upload
│   │   ├── controllers/ # Logique métier
│   │   ├── middleware/   # Auth, validation
│   │   ├── routes/      # Express router
│   │   └── app.js       # Configuration Express
│   └── tests/           # Tests Jest + Supertest
├── frontend/
│   ├── src/
│   │   ├── components/  # UI (Card, Button, Input, Badge, StatCard, Pagination, ThemeToggle, ImageUpload)
│   │   ├── context/     # AuthContext, CartContext, SocketContext, ThemeContext, ToastContext
│   │   ├── layouts/     # PublicLayout, AdminLayout
│   │   ├── pages/       # Pages utilisateur + admin + livreur
│   │   └── services/    # API client
│   └── vite.config.js   # Proxy /api + /uploads vers backend
└── docker-compose.yml   # MongoDB + backend + frontend + nginx
```
