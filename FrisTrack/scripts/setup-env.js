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

const ip = getLocalIP();
const envContent = `EXPO_PUBLIC_API_URL=http://${ip}:3300/api`;
const envPath = path.join(process.cwd(), "", ".env");

const envDir = path.dirname(envPath);
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}
fs.writeFileSync(envPath, envContent);
console.log(`.env file created with IP: ${ip}`);
