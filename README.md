# Dakar Gourmet - Plateforme de restauration

Plateforme complète de commande et de gestion de restaurant avec livraison.

## Stack technique

### Backend
- Node.js / Express 5
- Prisma ORM
- MongoDB 7 (replica set)
- Socket.io
- JWT Auth

### Frontend
- React 19
- Vite 6
- Tailwind CSS 3
- shadcn/ui

## Structure

```
restaurant-platform/
├── backend/          # API REST + WebSocket
│   ├── prisma/       # Schéma et migrations
│   ├── src/          # Code source
│   │   ├── routes/   # Routes API
│   │   ├── services/ # Logique métier
│   │   ├── middleware/
│   │   └── socket.js # WebSocket
│   └── tests/        # Tests (Jest)
├── frontend/         # Application React
│   └── src/
│       ├── pages/
│       ├── components/ui/
│       ├── context/
│       ├── services/
│       └── layouts/
└── docker-compose.yml
```

## Démarrage

```bash
# Backend
cd backend
npm install
npx prisma generate
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```
