# WitzeApp 🃏

Fullstack Witze-App (NestJS + Next.js + Prisma/PostgreSQL)

## Features
- ✅ User Auth (JWT)
- ✅ Post/View/Like Witze
- ✅ **Profil: Witze anzeigen/editieren/löschen + Stats/Rang**
- 🔄 Kategorien, Reports, Admin (soon)

## Local Setup
```bash
# Backend
cd backend
npm i
cp .env.example .env  # DATABASE_URL, JWT_SECRET
npx prisma db push
npm run start:dev

# Frontend
cd frontend
npm i
npm run dev
