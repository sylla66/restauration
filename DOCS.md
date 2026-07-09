# Documentation Plateforme de Restauration

## Demarrage

### Pre-requis
- Node.js 18+
- MongoDB (Docker)

### Lancer l'application

```bash
# 1. Backend (port 3001)
cd backend
npm install
npm run dev

# 2. Frontend (port 5173)
cd frontend
npm install
npm run dev
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

| Role | Telephone | Mot de passe |
|---|---|---|
| ADMIN (proprietaire) | `77 000 00 01` | `admin123` |
| CLIENT | `77 000 00 02` | `admin123` |
| LIVREUR | `77 000 00 03` | `admin123` |
| GERANT Dakar Gourmet | `77 000 00 98` | `admin123` |
| GERANT Chez Mama Africa | `77 000 00 99` | `admin123` |

Pour generer les 2 restaurants + menus de demo :
```bash
curl -X POST http://localhost:3001/api/restaurants/seed
```
Puis recreer les GERANTs via Admin > Personnel.

---

## Interface Admin

### Gestion du Menu (`/admin/menu`)
- Creation / Modification / Suppression de categories
- Creation / Modification / Suppression de plats
- Attribution a une categorie
- Prix, description, image URL

### Inventaire (`/admin/inventory`)
- Stock en temps reel par plat
- Activation/desactivation de la disponibilite
- Carte "Livraisons en cours" avec livreur assigne
- Alerte stock bas <= 3

### Commandes (`/admin/orders`)
- Filtre par statut
- Changement de statut (PENDING > CONFIRMED > PREPARING > READY > DELIVERED)
- Assignation d'un livreur (modal avec selection + temps estime)
- Affichage du livreur assigne dans la liste

### Livraisons (`/admin/deliveries`)
- Liste toutes les livraisons filtrees par restaurant (GERANT) ou toutes (ADMIN)
- Filtre par statut (Assignee, Ramassee, En transit, Livree)
- Lien vers le detail livraison

### Personnel (`/admin/staff`)
- Creation de comptes ADMIN, GERANT, LIVREUR
- Selection du restaurant pour le role GERANT

### Utilisateurs (`/admin/users`)
- Liste avec filtres par role (Administrateur, Gerant, Livreur, Client)
- Activation/desactivation de compte

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
| POST | `/api/auth/register-staff` | Creer staff (ADMIN/GERANT/LIVREUR) | ADMIN |
| GET | `/api/restaurants` | Liste restaurants | - |
| POST | `/api/restaurants` | Creer restaurant | ADMIN |
| GET | `/api/restaurants/:id` | Detail restaurant | - |
| PUT | `/api/restaurants/:id` | Modifier restaurant | ADMIN |
| DELETE | `/api/restaurants/:id` | Supprimer restaurant | ADMIN |
| POST | `/api/restaurants/seed` | Generer donnees seed | - |
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
| PATCH | `/api/deliveries/:id/status` | Changer statut livraison | LIVREUR/ADMIN |
| POST | `/api/reviews` | Creer avis | Auth |
| POST | `/api/complaints` | Creer reclamation | Auth |
| GET | `/api/users` | Liste utilisateurs | ADMIN/GERANT |
| PATCH | `/api/users/:id/toggle` | Activer/desactiver | ADMIN |
| GET | `/api/dashboard/sales` | Ventes | ADMIN/GERANT |
| GET | `/api/dashboard/top-items` | Top plats | ADMIN/GERANT |
| GET | `/api/dashboard/cancellations` | Annulations | ADMIN/GERANT |
| GET | `/api/dashboard/delivery-times` | Temps livraison | ADMIN/GERANT |

---

## Fonctionnalites

- Dark mode : bouton lune/soleil en haut a droite
- Responsive : menu hamburger mobile, sidebar overlay
- Multi-restaurant : proprietaire (`ownerId`), filtre "Mes restaurants"
- Roles : ADMIN, GERANT, LIVREUR, CLIENT
- Gestion de stock et inventaire
- Assignation de livreur aux commandes
- Suivi de livraison en temps reel (socket.io)
- Impression de facture
- Avis et reclamations
- Dashboard avec ventes, top plats, annulations
