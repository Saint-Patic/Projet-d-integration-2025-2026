/**
 * Hook React pour utiliser le service Bluetooth GPS
 * 
 * Fournit un accès facile au service Bluetooth GPS avec gestion
 * automatique du cycle de vie et des états React.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  bluetoothGPSService,
  PICO_DEVICE_NAME,
  type BluetoothGPSState,
  type GPSData,
} from '@/services/bluetoothGPS';

// Type Device simplifié pour éviter les problèmes d'import
interface Device {
  id: string;
  name: string | null;
}

interface UseBluetoothGPSOptions {
  /** S'abonner automatiquement aux mises à jour GPS */
  autoSubscribe?: boolean;
  /** Nom du device à rechercher lors du scan automatique */
  deviceName?: string;
}

interface UseBluetoothGPSReturn {
  // État
  state: BluetoothGPSState;
  isScanning: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  lastGPSData: GPSData | null;
  discoveredDevices: Device[];
  error: string | null;
  
  // Actions
  startScanning: (filterByName?: string, timeout?: number) => Promise<Device[]>;
  stopScanning: () => void;
  connectToDevice: (device: Device) => Promise<void>;
  autoConnect: (deviceName?: string) => Promise<Device | null>;
  disconnect: () => Promise<void>;
  
  // Helpers
  hasValidGPS: boolean;
  formattedPosition: string | null;
}

export function useBluetoothGPS(options: UseBluetoothGPSOptions = {}): UseBluetoothGPSReturn {
  const { 
    autoSubscribe = true,
    deviceName = PICO_DEVICE_NAME,
  } = options;

  const [state, setState] = useState<BluetoothGPSState>(bluetoothGPSService.getState());
  const [lastGPSData, setLastGPSData] = useState<GPSData | null>(null);

  // S'abonner aux changements d'état du service
  useEffect(() => {
    const unsubscribeState = bluetoothGPSService.onStateChange((newState) => {
      setState(newState);
    });

    let unsubscribeGPS: (() => void) | undefined;
    
    if (autoSubscribe) {
      unsubscribeGPS = bluetoothGPSService.onGPSData((data) => {
        setLastGPSData(data);
      });
    }

    return () => {
      unsubscribeState();
      unsubscribeGPS?.();
    };
  }, [autoSubscribe]);

  // Actions
  const startScanning = useCallback(
    async (filterByName?: string, timeout?: number) => {
      return bluetoothGPSService.startScanning(filterByName ?? deviceName, timeout);
    },
    [deviceName]
  );

  const stopScanning = useCallback(() => {
    bluetoothGPSService.stopScanning();
  }, []);

  const connectToDevice = useCallback(async (device: any) => {
    await bluetoothGPSService.connectToDevice(device);
  }, []);

  const autoConnect = useCallback(
    async (name?: string) => {
      return bluetoothGPSService.autoConnect(name ?? deviceName);
    },
    [deviceName]
  );

  const disconnect = useCallback(async () => {
    await bluetoothGPSService.disconnect();
    setLastGPSData(null);
  }, []);

  // Helpers
  const hasValidGPS = lastGPSData?.isValid ?? false;
  
  const formattedPosition = lastGPSData && lastGPSData.isValid
    ? `${lastGPSData.latitude.toFixed(6)}, ${lastGPSData.longitude.toFixed(6)}`
    : null;

  return {
    // État
    state,
    isScanning: state.isScanning,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    lastGPSData: lastGPSData ?? state.lastGPSData,
    discoveredDevices: state.discoveredDevices,
    error: state.error,
    
    // Actions
    startScanning,
    stopScanning,
    connectToDevice,
    autoConnect,
    disconnect,
    
    // Helpers
    hasValidGPS,
    formattedPosition,
  };
}

export default useBluetoothGPS;
