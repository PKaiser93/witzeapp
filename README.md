# WitzeApp

Eine Full-Stack Web-Applikation zum Teilen und Bewerten von Witzen.

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS

**Backend**
- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Features

- Registrierung & Login mit JWT
- Witze posten, bearbeiten, löschen
- Likes mit Anzeige wer geliked hat
- Kommentare (Feed + Detailseite)
- Kategorien mit Filter
- Rollen-System (USER, ADMIN, MODERATOR)
- Profil-Seite mit Statistiken & Rang
- Admin-Bereich (Kategorien verwalten)

## Setup

### Voraussetzungen
- Node.js 18+
- Docker

### Backend

cd backend
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d
npm install
npx prisma db push
npm run start:dev

### Frontend

cd frontend
cp .env.local.example .env.local
npm install
npm run dev

## Umgebungsvariablen

### Backend .env

DATABASE_URL=postgresql://witzeuser:devpass123@localhost:5433/witzeapp
JWT_SECRET=dein-secret

### Frontend .env.local

NEXT_PUBLIC_API_URL=http://localhost:3000
