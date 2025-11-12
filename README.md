# FrisTrack - Projet d'intégration 2025-2026

## 📋 Description

Application de gestion d'équipes de frisbee permettant aux coachs de gérer leurs joueurs, matchs et statistiques.

## 🏗️ Architecture du projet

```
.
├── server/        # API REST (Node.js + Express)
├── DB/       # Scripts SQL et migrations
└── FrisTrack/      # Application mobile (React Native/Expo)
```

## 🚀 Installation

### Prérequis

- Node.js
- npm ou yarn
- Expo CLI
- PostgreSQL (ou autre SGBD)

### Backend

```bash
cd server
npm [i]nstall
cp .env.example .env
node db.js
```

### Application mobile

```bash
cd FrisTrack
npm [i]nstall
npm start
```
