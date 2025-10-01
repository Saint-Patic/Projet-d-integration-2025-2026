# Projet d'intégration 2025-2026 - FrisTrack

Bienvenue sur le repository de notre projet d'intégration : **FrisTrack**, une application mobile de suivi d'entraînement Ultimate Frisbee développée avec React Native et Expo.

## 📱 À propos du projet

FrisTrack est une application mobile conçue pour aider les joueurs et entraîneurs d'Ultimate Frisbee à suivre leurs performances, analyser leurs statistiques et améliorer leur jeu.

## 🚀 Comment lancer le projet

### Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) : `npm install -g @expo/cli`

### Installation et lancement

1. **Cloner le repository**

   ```bash
   git clone https://github.com/Saint-Patic/Projet-d-integration-2025-2026.git
   cd Projet-d-integration-2025-2026/FrisTrack
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Lancer l'application**
   ```bash
   npm start
   ```
   ou
   ```bash
   npx expo start
   ```

### Options de développement

Une fois l'application lancée, vous aurez plusieurs options :

- **📱 Sur téléphone physique** : Scannez le QR code avec l'app [Expo Go](https://expo.dev/go)
- **📱 Émulateur Android** : Appuyez sur `a` ou utilisez `npm run android`
- **📱 Simulateur iOS** : Appuyez sur `i` ou utilisez `npm run ios` (macOS uniquement)
- **🌐 Navigateur web** : Appuyez sur `w` ou utilisez `npm run web`

### Scripts disponibles

- `npm start` : Lance le serveur de développement Expo
- `npm run android` : Lance l'app sur émulateur Android
- `npm run ios` : Lance l'app sur simulateur iOS
- `npm run web` : Lance l'app dans le navigateur
- `npm run lint` : Vérifie le code avec ESLint

## 🛠️ Technologies utilisées

- **React Native** : Framework pour le développement mobile
- **Expo** : Plateforme de développement React Native
- **TypeScript** : Langage de programmation typé
- **Expo Router** : Navigation basée sur les fichiers

## 📂 Structure du projet

```
FrisTrack/
├── app/              # Écrans de l'application (routing)
├── components/       # Composants réutilisables
├── constants/        # Constantes et thèmes
├── hooks/           # Hooks React personnalisés
├── assets/          # Images et ressources
└── scripts/         # Scripts utilitaires
```

## 🤝 Contribution

Pour contribuer au projet :

1. Créez une branche à partir de `main`
2. Effectuez vos modifications
3. Testez votre code
4. Créez une Pull Request

## 📞 Support

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur ce repository.
