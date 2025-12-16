/**
 * Service Bluetooth BLE pour connecter un GPS externe (Pico W)
 * 
 * Ce service permet de:
 * - Scanner les appareils BLE à proximité
 * - Se connecter au Pico W avec le capteur GPS
 * - Recevoir les données de localisation en temps réel
 * 
 * NOTE: react-native-ble-plx nécessite un Development Build (pas Expo Go)
 * Pour créer un dev build: npx expo run:android ou npx expo run:ios
 */

import { Platform, PermissionsAndroid } from 'react-native';

// Import dynamique pour éviter les erreurs dans Expo Go
let BleManager: any = null;
let State: any = { Unknown: 'Unknown', PoweredOn: 'PoweredOn', PoweredOff: 'PoweredOff' };
let base64Decode: (input: string) => string = (s) => s;
let ExpoDevice: any = { platformApiLevel: 0 };

// Flag pour savoir si BLE est disponible
let BLE_AVAILABLE = false;

// Tenter de charger les modules BLE (échouera dans Expo Go)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const blePlx = require('react-native-ble-plx');
  BleManager = blePlx.BleManager;
  State = blePlx.State;
  BLE_AVAILABLE = true;
  console.log('[BLE] Module react-native-ble-plx chargé avec succès');
} catch {
  console.warn('[BLE] react-native-ble-plx non disponible - BLE désactivé');
  console.warn('[BLE] Pour utiliser le GPS Bluetooth, créez un Development Build:');
  console.warn('[BLE]   npx expo run:android  ou  npx expo run:ios');
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const base64 = require('base-64');
  base64Decode = base64.decode;
} catch {
  console.warn('[BLE] Module base-64 non disponible');
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ExpoDevice = require('expo-device');
} catch {
  console.warn('[BLE] Module expo-device non disponible');
}

// Types locaux pour Device et Characteristic
interface Device {
  id: string;
  name: string | null;
  connect(options?: { timeout?: number }): Promise<Device>;
  discoverAllServicesAndCharacteristics(): Promise<Device>;
  services(): Promise<Service[]>;
  cancelConnection(): Promise<Device>;
  onDisconnected(listener: (error: any, device: Device | null) => void): void;
}

interface Service {
  uuid: string;
  characteristics(): Promise<Characteristic[]>;
}

interface Characteristic {
  uuid: string;
  value: string | null;
  isNotifiable: boolean;
  monitor(listener: (error: any, char: Characteristic | null) => void): void;
}


// UUIDs du service GPS sur le Pico W - À adapter selon votre configuration
// Ces UUIDs doivent correspondre à ceux définis dans le code MicroPython du Pico W
export const GPS_SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
export const GPS_CHARACTERISTIC_UUID = '12345678-1234-5678-1234-56789abcdef1';

// Nom par défaut du Pico W - À adapter selon votre configuration
export const PICO_DEVICE_NAME = 'PicoW-GPS';

export interface GPSData {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  timestamp: number;
  accuracy?: number;
  satellites?: number;
  isValid: boolean;
}

export interface BluetoothGPSState {
  isScanning: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  bluetoothState: any;
  connectedDevice: Device | null;
  lastGPSData: GPSData | null;
  discoveredDevices: Device[];
  error: string | null;
  isBleAvailable: boolean;
}

type GPSDataCallback = (data: GPSData) => void;
type StateChangeCallback = (state: BluetoothGPSState) => void;

class BluetoothGPSService {
  private manager: any = null;
  private state: BluetoothGPSState;
  private gpsCallbacks: Set<GPSDataCallback> = new Set();
  private stateCallbacks: Set<StateChangeCallback> = new Set();
  private gpsCharacteristic: Characteristic | null = null;

  constructor() {
    this.state = {
      isScanning: false,
      isConnected: false,
      isConnecting: false,
      bluetoothState: State.Unknown,
      connectedDevice: null,
      lastGPSData: null,
      discoveredDevices: [],
      error: BLE_AVAILABLE ? null : 'BLE non disponible (nécessite un Development Build)',
      isBleAvailable: BLE_AVAILABLE,
    };

    // Initialiser BleManager seulement si disponible
    if (BLE_AVAILABLE && BleManager) {
      try {
        this.manager = new BleManager();
        // Écouter les changements d'état du Bluetooth
        this.manager.onStateChange((state: any) => {
          this.updateState({ bluetoothState: state });
        }, true);
      } catch (e) {
        console.error('[BLE] Erreur initialisation BleManager:', e);
        this.updateState({ error: 'Erreur initialisation Bluetooth' });
      }
    }
  }

  private updateState(partial: Partial<BluetoothGPSState>) {
    this.state = { ...this.state, ...partial };
    this.stateCallbacks.forEach((cb) => cb(this.state));
  }

  /**
   * Vérifie et demande les permissions Bluetooth nécessaires
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // iOS gère les permissions automatiquement via Info.plist
      return true;
    }

    if (Platform.OS === 'android') {
      const apiLevel = ExpoDevice.platformApiLevel ?? 0;
      
      if (apiLevel < 31) {
        // Android 11 et inférieur
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permission de localisation',
            message: 'L\'application a besoin d\'accéder à la localisation pour le Bluetooth',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android 12+ (API 31+)
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);
        
        return Object.values(results).every(
          (result) => result === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }

    return false;
  }

  /**
   * Vérifie si le Bluetooth est activé
   */
  async isBluetoothEnabled(): Promise<boolean> {
    if (!BLE_AVAILABLE || !this.manager) {
      return false;
    }
    const state = await this.manager.state();
    return state === State.PoweredOn;
  }

  /**
   * Lance le scan des appareils BLE
   */
  async startScanning(
    filterByName: string = PICO_DEVICE_NAME,
    timeout: number = 10000
  ): Promise<Device[]> {
    if (!BLE_AVAILABLE || !this.manager) {
      this.updateState({ error: 'BLE non disponible. Créez un Development Build.' });
      throw new Error('BLE non disponible. Utilisez: npx expo run:android ou npx expo run:ios');
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      this.updateState({ error: 'Permissions Bluetooth non accordées' });
      throw new Error('Permissions Bluetooth non accordées');
    }

    const isEnabled = await this.isBluetoothEnabled();
    if (!isEnabled) {
      this.updateState({ error: 'Bluetooth désactivé' });
      throw new Error('Veuillez activer le Bluetooth');
    }

    return new Promise((resolve, reject) => {
      const discoveredDevices: Device[] = [];
      this.updateState({ 
        isScanning: true, 
        discoveredDevices: [],
        error: null 
      });

      const timeoutId = setTimeout(() => {
        this.stopScanning();
        resolve(discoveredDevices);
      }, timeout);

      this.manager.startDeviceScan(
        null, // Scanner tous les services
        { allowDuplicates: false },
        (error: any, device: Device | null) => {
          if (error) {
            clearTimeout(timeoutId);
            this.updateState({ isScanning: false, error: error.message });
            reject(error);
            return;
          }

          if (device && device.name) {
            // Filtrer par nom si spécifié, sinon garder tous les appareils avec un nom
            const shouldInclude = !filterByName || 
              device.name.toLowerCase().includes(filterByName.toLowerCase());
            
            if (shouldInclude) {
              // Éviter les doublons
              const exists = discoveredDevices.some((d) => d.id === device.id);
              if (!exists) {
                discoveredDevices.push(device);
                this.updateState({ discoveredDevices: [...discoveredDevices] });
                
                console.log(`[BLE] Appareil trouvé: ${device.name} (${device.id})`);
              }
            }
          }
        }
      );
    });
  }

  /**
   * Arrête le scan BLE
   */
  stopScanning() {
    if (!BLE_AVAILABLE || !this.manager) return;
    this.manager.stopDeviceScan();
    this.updateState({ isScanning: false });
    console.log('[BLE] Scan arrêté');
  }

  /**
   * Se connecte à un appareil BLE spécifique
   */
  async connectToDevice(device: Device): Promise<void> {
    if (!BLE_AVAILABLE) {
      throw new Error('BLE non disponible. Créez un Development Build.');
    }

    try {
      this.updateState({ isConnecting: true, error: null });
      console.log(`[BLE] Connexion à ${device.name}...`);

      // Se connecter à l'appareil
      const connectedDevice = await device.connect({
        timeout: 10000,
      });

      // Découvrir les services et caractéristiques
      const deviceWithServices = await connectedDevice.discoverAllServicesAndCharacteristics();

      // Chercher la caractéristique GPS
      const services = await deviceWithServices.services();
      let gpsCharacteristic: Characteristic | null = null;

      for (const service of services) {
        console.log(`[BLE] Service trouvé: ${service.uuid}`);
        const characteristics = await service.characteristics();
        
        for (const char of characteristics) {
          console.log(`[BLE]   Caractéristique: ${char.uuid}`);
          
          // Chercher notre caractéristique GPS spécifique ou utiliser une caractéristique notifiable
          if (
            char.uuid.toLowerCase() === GPS_CHARACTERISTIC_UUID.toLowerCase() ||
            char.isNotifiable
          ) {
            gpsCharacteristic = char;
            console.log(`[BLE] Caractéristique GPS trouvée: ${char.uuid}`);
            break;
          }
        }
        
        if (gpsCharacteristic) break;
      }

      if (!gpsCharacteristic) {
        throw new Error('Caractéristique GPS non trouvée sur l\'appareil');
      }

      this.gpsCharacteristic = gpsCharacteristic;

      // S'abonner aux notifications
      await this.subscribeToGPSData(gpsCharacteristic);

      // Écouter la déconnexion
      deviceWithServices.onDisconnected((error: any, disconnectedDevice: Device | null) => {
        console.log(`[BLE] Appareil déconnecté: ${disconnectedDevice?.name}`);
        this.updateState({
          isConnected: false,
          connectedDevice: null,
          lastGPSData: null,
        });
        this.gpsCharacteristic = null;
      });

      this.updateState({
        isConnecting: false,
        isConnected: true,
        connectedDevice: deviceWithServices,
      });

      console.log(`[BLE] Connecté à ${device.name}`);
    } catch (error: any) {
      console.error('[BLE] Erreur de connexion:', error);
      this.updateState({
        isConnecting: false,
        isConnected: false,
        error: error.message || 'Erreur de connexion',
      });
      throw error;
    }
  }

  /**
   * S'abonne aux notifications GPS
   */
  private async subscribeToGPSData(characteristic: Characteristic): Promise<void> {
    characteristic.monitor((error: any, char: Characteristic | null) => {
      if (error) {
        console.error('[BLE] Erreur de notification:', error);
        return;
      }

      if (char?.value) {
        try {
          // Décoder les données Base64
          const decoded = base64Decode(char.value);
          const gpsData = this.parseGPSData(decoded);
          
          if (gpsData) {
            this.updateState({ lastGPSData: gpsData });
            this.gpsCallbacks.forEach((cb) => cb(gpsData));
          }
        } catch (e) {
          console.error('[BLE] Erreur de parsing GPS:', e);
        }
      }
    });
  }

  /**
   * Parse les données GPS reçues du Pico W
   * Format attendu: JSON ou NMEA simplifié
   */
  private parseGPSData(data: string): GPSData | null {
    try {
      // Essayer de parser en JSON d'abord
      // Format attendu: {"lat":50.1234,"lon":4.5678,"alt":100,"spd":5.2,"sat":8,"valid":1}
      const json = JSON.parse(data);
      
      return {
        latitude: json.lat || json.latitude || 0,
        longitude: json.lon || json.longitude || 0,
        altitude: json.alt || json.altitude,
        speed: json.spd || json.speed,
        satellites: json.sat || json.satellites,
        accuracy: json.acc || json.accuracy,
        timestamp: json.ts || Date.now(),
        isValid: json.valid === 1 || json.valid === true || json.isValid === true,
      };
    } catch {
      // Si ce n'est pas du JSON, essayer de parser un format simple
      // Format: "lat,lon,alt,speed,satellites,valid"
      const parts = data.split(',');
      
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          return {
            latitude: lat,
            longitude: lon,
            altitude: parts[2] ? parseFloat(parts[2]) : undefined,
            speed: parts[3] ? parseFloat(parts[3]) : undefined,
            satellites: parts[4] ? parseInt(parts[4], 10) : undefined,
            timestamp: Date.now(),
            isValid: parts[5] === '1' || lat !== 0 || lon !== 0,
          };
        }
      }
      
      console.warn('[BLE] Format GPS non reconnu:', data);
      return null;
    }
  }

  /**
   * Se connecte automatiquement au premier Pico W trouvé
   */
  async autoConnect(deviceName: string = PICO_DEVICE_NAME): Promise<Device | null> {
    try {
      const devices = await this.startScanning(deviceName, 8000);
      
      if (devices.length > 0) {
        const picoDevice = devices[0];
        await this.connectToDevice(picoDevice);
        return picoDevice;
      }
      
      this.updateState({ error: 'Aucun Pico W GPS trouvé' });
      return null;
    } catch (error: any) {
      console.error('[BLE] Erreur autoConnect:', error);
      throw error;
    }
  }

  /**
   * Se déconnecte de l'appareil actuel
   */
  async disconnect(): Promise<void> {
    if (this.state.connectedDevice) {
      try {
        await this.state.connectedDevice.cancelConnection();
      } catch (error) {
        console.error('[BLE] Erreur déconnexion:', error);
      }
    }

    this.gpsCharacteristic = null;
    this.updateState({
      isConnected: false,
      connectedDevice: null,
      lastGPSData: null,
    });
  }

  /**
   * S'abonne aux mises à jour GPS
   */
  onGPSData(callback: GPSDataCallback): () => void {
    this.gpsCallbacks.add(callback);
    return () => this.gpsCallbacks.delete(callback);
  }

  /**
   * S'abonne aux changements d'état
   */
  onStateChange(callback: StateChangeCallback): () => void {
    this.stateCallbacks.add(callback);
    // Envoyer l'état actuel immédiatement
    callback(this.state);
    return () => this.stateCallbacks.delete(callback);
  }

  /**
   * Récupère l'état actuel
   */
  getState(): BluetoothGPSState {
    return { ...this.state };
  }

  /**
   * Récupère les dernières données GPS
   */
  getLastGPSData(): GPSData | null {
    return this.state.lastGPSData;
  }

  /**
   * Détruit le service et libère les ressources
   */
  destroy() {
    this.stopScanning();
    this.disconnect();
    if (this.manager) {
      this.manager.destroy();
    }
    this.gpsCallbacks.clear();
    this.stateCallbacks.clear();
  }

  /**
   * Vérifie si BLE est disponible
   */
  isBleAvailable(): boolean {
    return BLE_AVAILABLE;
  }
}

// Instance singleton du service
export const bluetoothGPSService = new BluetoothGPSService();

export default bluetoothGPSService;
