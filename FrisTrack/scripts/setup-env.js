const os = require("os");
const fs = require("fs");
const path = require("path");

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  let wifiIP = null;
  let fallbackIP = null;

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignore les adresses internes et IPv6
      if (iface.family === "IPv4" && !iface.internal) {
        // Priorité 1 : Recherche une interface Wi-Fi
        if (
          name.toLowerCase().includes("wi-fi") ||
          name.toLowerCase().includes("wifi") ||
          name.toLowerCase().includes("wlan")
        ) {
          wifiIP = iface.address;
        }
        // Sauvegarde la première adresse IP trouvée comme fallback
        else if (!fallbackIP) {
          fallbackIP = iface.address;
        }
      }
    }
  }

  return wifiIP || fallbackIP || "localhost";
}

const envPath = path.join(process.cwd(), ".env");

// Vérifier si on est en mode production
const isProduction =
  process.env.NODE_ENV === "production" ||
  process.argv.includes("--production");

// Si le fichier .env existe déjà et contient une URL de production, ne pas la modifier
if (fs.existsSync(envPath)) {
  const existingEnv = fs.readFileSync(envPath, "utf8");

  // Détecter si l'URL actuelle est une URL de production (https ou domaine)
  if (
    existingEnv.includes("https://") ||
    existingEnv.includes("fristrack.duckdns.org")
  ) {
    console.log(
      "⚠️  Production URL detected in .env file - skipping auto-configuration"
    );
    console.log("Current configuration preserved:");
    console.log(existingEnv);
    process.exit(0);
  }

  // Si le flag --production est passé, ne pas modifier
  if (isProduction) {
    console.log("⚠️  Production mode detected - skipping auto-configuration");
    console.log("Please configure .env manually with production URL");
    process.exit(0);
  }
}

// Mode développement : configurer avec l'IP locale
const ip = getLocalIP();
const envContent = `EXPO_PUBLIC_API_URL=http://${ip}:3300/api`;

const envDir = path.dirname(envPath);
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

fs.writeFileSync(envPath, envContent);
console.log("✅ .env file created for development with local IP");
console.log(`📍 API URL: http://${ip}:3300/api`);
console.log("");
console.log("💡 For production, manually set:");
console.log("   EXPO_PUBLIC_API_URL=https://fristrack.duckdns.org/api");
