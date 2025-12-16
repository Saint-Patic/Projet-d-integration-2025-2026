/**
 * Composant de sélection de la source GPS
 * 
 * Permet de basculer entre le GPS du téléphone et le GPS Bluetooth (Pico W)
 * Affiche l'état de connexion et permet de scanner/connecter les appareils
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useGPS, type GPSSource } from '@/contexts/GPSContext';

// Type Device simplifié pour éviter les problèmes d'import
interface Device {
  id: string;
  name: string | null;
}

interface GPSSelectorProps {
  theme: {
    background: string;
    card: string;
    text: string;
    primary: string;
    border: string;
    secondary?: string;
  };
}

export function GPSSelector({ theme }: GPSSelectorProps) {
  const {
    gpsSource,
    setGPSSource,
    isBluetoothConnected,
    isBluetoothConnecting,
    isScanning,
    discoveredDevices,
    bluetoothError,
    isBleAvailable,
    scanForDevices,
    stopScanning,
    connectToDevice,
    disconnectBluetooth,
    currentLocation,
  } = useGPS();

  const [showDeviceModal, setShowDeviceModal] = useState(false);

  const handleScanDevices = async () => {
    if (!isBleAvailable) {
      Alert.alert(
        'Bluetooth non disponible',
        'Le Bluetooth BLE nécessite un Development Build.\n\nPour activer cette fonctionnalité:\n\n1. npx expo run:android\nou\n2. npx expo run:ios',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowDeviceModal(true);
    try {
      await scanForDevices('');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de scanner les appareils');
    }
  };

  const handleConnectDevice = async (device: Device) => {
    try {
      await connectToDevice(device);
      setShowDeviceModal(false);
      setGPSSource('bluetooth');
      Alert.alert('Succès', `Connecté à ${device.name || 'appareil'}`);
    } catch (error: any) {
      Alert.alert('Erreur de connexion', error.message || 'Impossible de se connecter');
    }
  };

  const handleDisconnect = async () => {
    await disconnectBluetooth();
    setGPSSource('phone');
  };

  const handleSourceChange = (source: GPSSource) => {
    if (source === 'bluetooth' && !isBluetoothConnected) {
      handleScanDevices();
    } else {
      setGPSSource(source);
    }
  };

  const getSourceIcon = (source: GPSSource) => {
    return source === 'phone' ? '📱' : '📡';
  };

  const getStatusColor = () => {
    if (gpsSource === 'bluetooth') {
      return isBluetoothConnected ? '#27ae60' : '#e74c3c';
    }
    return currentLocation ? '#27ae60' : '#f39c12';
  };

  return (
    <View style={styles.container}>
      {/* Sélecteur de source */}
      <View style={[styles.selectorRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.sourceButton,
            gpsSource === 'phone' && { backgroundColor: theme.primary },
          ]}
          onPress={() => handleSourceChange('phone')}
        >
          <ThemedText style={[
            styles.sourceButtonText,
            { color: gpsSource === 'phone' ? '#fff' : theme.text }
          ]}>
            📱 Téléphone
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sourceButton,
            gpsSource === 'bluetooth' && { backgroundColor: theme.primary },
            !isBleAvailable && { opacity: 0.5 },
          ]}
          onPress={() => handleSourceChange('bluetooth')}
        >
          <ThemedText style={[
            styles.sourceButtonText,
            { color: gpsSource === 'bluetooth' ? '#fff' : theme.text }
          ]}>
            📡 Pico W GPS {!isBleAvailable && '⚠️'}
          </ThemedText>
          {isBluetoothConnecting && (
            <ActivityIndicator size="small" color={theme.text} style={styles.spinner} />
          )}
        </TouchableOpacity>
      </View>

      {/* Avertissement si BLE non disponible */}
      {!isBleAvailable && (
        <View style={[styles.warningBox, { backgroundColor: '#fff3cd' }]}>
          <ThemedText style={styles.warningText}>
            ⚠️ GPS Bluetooth nécessite un Development Build
          </ThemedText>
        </View>
      )}

      {/* Indicateur d'état */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <ThemedText style={[styles.statusText, { color: theme.text }]}>
          {gpsSource === 'phone' ? 'GPS Téléphone' : 
            isBluetoothConnected ? 'GPS Pico W connecté' : 'Non connecté'}
        </ThemedText>
        
        {gpsSource === 'bluetooth' && isBluetoothConnected && (
          <TouchableOpacity
            style={[styles.disconnectButton, { borderColor: '#e74c3c' }]}
            onPress={handleDisconnect}
          >
            <ThemedText style={{ color: '#e74c3c', fontSize: 12 }}>
              Déconnecter
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Affichage de la position actuelle */}
      {currentLocation && (
        <View style={[styles.positionInfo, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText style={[styles.positionLabel, { color: theme.text }]}>
            {getSourceIcon(currentLocation.source)} Position actuelle:
          </ThemedText>
          <ThemedText style={[styles.positionCoords, { color: theme.primary }]}>
            {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </ThemedText>
          {currentLocation.accuracy && (
            <ThemedText style={[styles.positionAccuracy, { color: theme.text }]}>
              Précision: ±{currentLocation.accuracy.toFixed(1)}m
            </ThemedText>
          )}
        </View>
      )}

      {/* Erreur Bluetooth */}
      {bluetoothError && gpsSource === 'bluetooth' && (
        <View style={[styles.errorBox, { backgroundColor: '#ffebee' }]}>
          <ThemedText style={styles.errorText}>
            ⚠️ {bluetoothError}
          </ThemedText>
        </View>
      )}

      {/* Modal de sélection d'appareil */}
      <Modal
        visible={showDeviceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          stopScanning();
          setShowDeviceModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <ThemedText style={[styles.modalTitle, { color: theme.text }]}>
              📡 Appareils Bluetooth GPS
            </ThemedText>

            {isScanning && (
              <View style={styles.scanningRow}>
                <ActivityIndicator size="small" color={theme.primary} />
                <ThemedText style={[styles.scanningText, { color: theme.text }]}>
                  Recherche en cours...
                </ThemedText>
              </View>
            )}

            <FlatList
              data={discoveredDevices}
              keyExtractor={(item) => item.id}
              style={styles.deviceList}
              ListEmptyComponent={
                <ThemedText style={[styles.emptyText, { color: theme.text }]}>
                  {isScanning ? 'Recherche d\'appareils...' : 'Aucun appareil trouvé'}
                </ThemedText>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.deviceItem, { 
                    backgroundColor: theme.card, 
                    borderColor: theme.border 
                  }]}
                  onPress={() => handleConnectDevice(item)}
                  disabled={isBluetoothConnecting}
                >
                  <View style={styles.deviceInfo}>
                    <ThemedText style={[styles.deviceName, { color: theme.text }]}>
                      {item.name || 'Appareil inconnu'}
                    </ThemedText>
                    <ThemedText style={[styles.deviceId, { color: theme.text }]}>
                      {item.id}
                    </ThemedText>
                  </View>
                  {isBluetoothConnecting ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <ThemedText style={{ color: theme.primary }}>Connecter</ThemedText>
                  )}
                </TouchableOpacity>
              )}
            />

            <View style={styles.modalButtons}>
              {!isScanning ? (
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={handleScanDevices}
                >
                  <ThemedText style={styles.modalButtonText}>
                    🔄 Relancer le scan
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#e74c3c' }]}
                  onPress={stopScanning}
                >
                  <ThemedText style={styles.modalButtonText}>
                    ⏹ Arrêter le scan
                  </ThemedText>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
                onPress={() => {
                  stopScanning();
                  setShowDeviceModal(false);
                }}
              >
                <ThemedText style={[styles.modalButtonText, { color: theme.text }]}>
                  Fermer
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  selectorRow: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sourceButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sourceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  spinner: {
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    flex: 1,
  },
  disconnectButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  positionInfo: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  positionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  positionCoords: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  positionAccuracy: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  errorBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 6,
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  scanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scanningText: {
    marginLeft: 10,
    fontSize: 14,
  },
  deviceList: {
    maxHeight: 300,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 30,
    opacity: 0.6,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
  },
  deviceId: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
  modalButtons: {
    marginTop: 16,
    gap: 10,
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  warningBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  warningText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default GPSSelector;
