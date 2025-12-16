/**
 * Contexte GPS unifié pour l'application
 * 
 * Ce contexte permet de basculer entre:
 * - Le GPS du téléphone (via expo-location)
 * - Le GPS externe du Pico W (via Bluetooth)
 * 
 * Il fournit une interface unifiée pour obtenir la position actuelle,
 * quelle que soit la source utilisée.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { bluetoothGPSService } from '@/services/bluetoothGPS';
import type { GPSData } from '@/services/bluetoothGPS';

// Type Device simplifié pour éviter les problèmes d'import
interface Device {
  id: string;
  name: string | null;
}

export type GPSSource = 'phone' | 'bluetooth';

export interface UnifiedLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  timestamp: number;
  source: GPSSource;
  isValid: boolean;
}

interface GPSContextValue {
  // Position actuelle unifiée
  currentLocation: UnifiedLocation | null;
  
  // Source GPS
  gpsSource: GPSSource;
  setGPSSource: (source: GPSSource) => void;
  
  // État Bluetooth
  isBluetoothConnected: boolean;
  isBluetoothConnecting: boolean;
  isScanning: boolean;
  discoveredDevices: Device[];
  bluetoothError: string | null;
  isBleAvailable: boolean;
  
  // État téléphone
  phoneLocationError: string | null;
  phonePermissionGranted: boolean;
  
  // Actions Bluetooth
  scanForDevices: (filterByName?: string) => Promise<Device[]>;
  stopScanning: () => void;
  connectToDevice: (device: Device) => Promise<void>;
  autoConnectBluetooth: (deviceName?: string) => Promise<Device | null>;
  disconnectBluetooth: () => Promise<void>;
  
  // Actions générales
  requestPhonePermission: () => Promise<boolean>;
  
  // Helpers
  isLoading: boolean;
  hasValidPosition: boolean;
  formattedPosition: string | null;
}

const GPSContext = createContext<GPSContextValue | undefined>(undefined);

interface GPSProviderProps {
  children: React.ReactNode;
  /** Source GPS par défaut */
  defaultSource?: GPSSource;
  /** Activer la surveillance automatique de la position du téléphone */
  autoWatchPhoneLocation?: boolean;
}

export function GPSProvider({
  children,
  defaultSource = 'phone',
  autoWatchPhoneLocation = false,
}: GPSProviderProps) {
  // Source GPS actuelle
  const [gpsSource, setGPSSource] = useState<GPSSource>(defaultSource);
  
  // Position téléphone
  const [phoneLocation, setPhoneLocation] = useState<Location.LocationObject | null>(null);
  const [phoneLocationError, setPhoneLocationError] = useState<string | null>(null);
  const [phonePermissionGranted, setPhonePermissionGranted] = useState(false);
  const phoneSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  
  // Position Bluetooth
  const [bluetoothLocation, setBluetoothLocation] = useState<GPSData | null>(null);
  const [bluetoothState, setBluetoothState] = useState(bluetoothGPSService.getState());

  // S'abonner aux changements Bluetooth
  useEffect(() => {
    const unsubscribeState = bluetoothGPSService.onStateChange(setBluetoothState);
    const unsubscribeGPS = bluetoothGPSService.onGPSData(setBluetoothLocation);

    return () => {
      unsubscribeState();
      unsubscribeGPS();
    };
  }, []);

  // Demander les permissions du téléphone
  const requestPhonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPhonePermissionGranted(granted);
      
      if (!granted) {
        setPhoneLocationError('Permission de localisation refusée');
      } else {
        setPhoneLocationError(null);
      }
      
      return granted;
    } catch (error: any) {
      setPhoneLocationError(error.message || 'Erreur lors de la demande de permission');
      return false;
    }
  }, []);

  // Démarrer la surveillance de la position du téléphone
  const startPhoneLocationWatch = useCallback(async () => {
    if (phoneSubscriptionRef.current) return;

    const granted = await requestPhonePermission();
    if (!granted) return;

    try {
      phoneSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 100,
          distanceInterval: 0,
        },
        (location) => {
          setPhoneLocation(location);
          setPhoneLocationError(null);
        }
      );
    } catch (error: any) {
      setPhoneLocationError(error.message || 'Erreur de localisation');
    }
  }, [requestPhonePermission]);

  // Arrêter la surveillance de la position du téléphone
  const stopPhoneLocationWatch = useCallback(() => {
    if (phoneSubscriptionRef.current) {
      phoneSubscriptionRef.current.remove();
      phoneSubscriptionRef.current = null;
    }
  }, []);

  // Démarrer automatiquement la surveillance si demandé
  useEffect(() => {
    if (autoWatchPhoneLocation && gpsSource === 'phone') {
      startPhoneLocationWatch();
    }

    return () => {
      stopPhoneLocationWatch();
    };
  }, [autoWatchPhoneLocation, gpsSource, startPhoneLocationWatch, stopPhoneLocationWatch]);

  // Basculer automatiquement sur le téléphone si Bluetooth déconnecté
  useEffect(() => {
    if (gpsSource === 'bluetooth' && !bluetoothState.isConnected && bluetoothState.error) {
      console.log('[GPS] Bluetooth déconnecté, bascule sur GPS téléphone');
      // On ne bascule pas automatiquement pour laisser le contrôle à l'utilisateur
      // setGPSSource('phone');
    }
  }, [gpsSource, bluetoothState.isConnected, bluetoothState.error]);

  // Calculer la position unifiée
  const currentLocation: UnifiedLocation | null = (() => {
    if (gpsSource === 'bluetooth' && bluetoothLocation && bluetoothLocation.isValid) {
      return {
        latitude: bluetoothLocation.latitude,
        longitude: bluetoothLocation.longitude,
        altitude: bluetoothLocation.altitude,
        accuracy: bluetoothLocation.accuracy,
        speed: bluetoothLocation.speed,
        timestamp: bluetoothLocation.timestamp,
        source: 'bluetooth' as GPSSource,
        isValid: true,
      };
    }
    
    if (phoneLocation) {
      return {
        latitude: phoneLocation.coords.latitude,
        longitude: phoneLocation.coords.longitude,
        altitude: phoneLocation.coords.altitude ?? undefined,
        accuracy: phoneLocation.coords.accuracy ?? undefined,
        speed: phoneLocation.coords.speed ?? undefined,
        timestamp: phoneLocation.timestamp,
        source: 'phone' as GPSSource,
        isValid: true,
      };
    }
    
    return null;
  })();

  // Actions Bluetooth
  const scanForDevices = useCallback(async (filterByName?: string) => {
    return bluetoothGPSService.startScanning(filterByName);
  }, []);

  const stopScanning = useCallback(() => {
    bluetoothGPSService.stopScanning();
  }, []);

  const connectToDevice = useCallback(async (device: any) => {
    await bluetoothGPSService.connectToDevice(device);
  }, []);

  const autoConnectBluetooth = useCallback(async (deviceName?: string) => {
    return bluetoothGPSService.autoConnect(deviceName);
  }, []);

  const disconnectBluetooth = useCallback(async () => {
    await bluetoothGPSService.disconnect();
    setBluetoothLocation(null);
  }, []);

  // Helpers
  const isLoading = bluetoothState.isConnecting || bluetoothState.isScanning;
  const hasValidPosition = currentLocation !== null && currentLocation.isValid;
  const formattedPosition = currentLocation && currentLocation.isValid
    ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
    : null;

  const value: GPSContextValue = {
    currentLocation,
    gpsSource,
    setGPSSource,
    
    isBluetoothConnected: bluetoothState.isConnected,
    isBluetoothConnecting: bluetoothState.isConnecting,
    isScanning: bluetoothState.isScanning,
    discoveredDevices: bluetoothState.discoveredDevices,
    bluetoothError: bluetoothState.error,
    isBleAvailable: bluetoothState.isBleAvailable ?? false,
    
    phoneLocationError,
    phonePermissionGranted,
    
    scanForDevices,
    stopScanning,
    connectToDevice,
    autoConnectBluetooth,
    disconnectBluetooth,
    
    requestPhonePermission,
    
    isLoading,
    hasValidPosition,
    formattedPosition,
  };

  return <GPSContext.Provider value={value}>{children}</GPSContext.Provider>;
}

export function useGPS(): GPSContextValue {
  const context = useContext(GPSContext);
  if (!context) {
    throw new Error('useGPS doit être utilisé dans un GPSProvider');
  }
  return context;
}

export default GPSContext;
