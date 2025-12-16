# Configuration et instructions pour le Pico W GPS Bluetooth

## Matériel requis

- Raspberry Pi Pico W
- Module GPS (NEO-6M, NEO-7M, BN-220, ou similaire)
- Câbles de connexion

## Schéma de câblage

```
Module GPS        Pico W
---------        ------
VCC -----------> 3V3 (pin 36) ou VSYS (pin 39 pour 5V)
GND -----------> GND (pin 38)
TX -----------> GP1 (pin 2) - UART0 RX
RX -----------> GP0 (pin 1) - UART0 TX (optionnel)
```

## Installation du firmware MicroPython

1. **Télécharger le firmware MicroPython pour Pico W**
   - Aller sur https://micropython.org/download/RPI_PICO_W/
   - Télécharger le fichier .uf2 le plus récent

2. **Flasher le Pico W**
   - Maintenir le bouton BOOTSEL appuyé
   - Brancher le Pico W en USB
   - Relâcher BOOTSEL
   - Copier le fichier .uf2 sur le lecteur RPI-RP2 qui apparaît

3. **Transférer le code**
   - Utiliser Thonny IDE ou mpremote
   - Copier `main.py` sur le Pico W
   - Le code démarrera automatiquement au prochain boot

## Configuration

### Modifier le nom Bluetooth
Dans `main.py`, changer la ligne:
```python
ble_gps = BLEGPS(name="PicoW-GPS")
```

### Modifier les pins UART
Si vous utilisez d'autres pins pour le GPS:
```python
gps = GPSReader(uart_id=0, tx_pin=0, rx_pin=1, baudrate=9600)
```

Options UART:
- UART0: GP0 (TX), GP1 (RX) - par défaut
- UART1: GP4 (TX), GP5 (RX)

### Modifier le baudrate
La plupart des modules GPS utilisent 9600 baud par défaut.
Certains modules (comme BN-220) peuvent être configurés pour 115200.

## Format des données BLE

Les données sont envoyées en JSON:
```json
{
  "lat": 50.123456,
  "lon": 4.567890,
  "alt": 150.5,
  "spd": 5.2,
  "sat": 8,
  "valid": 1,
  "ts": 123456789
}
```

- `lat`: Latitude en degrés décimaux
- `lon`: Longitude en degrés décimaux  
- `alt`: Altitude en mètres
- `spd`: Vitesse en km/h
- `sat`: Nombre de satellites
- `valid`: 1 si fix GPS valide, 0 sinon
- `ts`: Timestamp en millisecondes

## UUIDs BLE

Ces UUIDs doivent correspondre à ceux dans l'application FrisTrack:

- **Service UUID**: `12345678-1234-5678-1234-56789abcdef0`
- **Caractéristique GPS**: `12345678-1234-5678-1234-56789abcdef1`

## Dépannage

### Le GPS ne capte pas de signal
- Assurez-vous d'être en extérieur ou près d'une fenêtre
- Le premier fix peut prendre 1-5 minutes (cold start)
- Vérifiez que l'antenne GPS est correctement connectée

### Pas de connexion Bluetooth
- Vérifiez que le Bluetooth est activé sur le téléphone
- L'appareil doit apparaître comme "PicoW-GPS" dans le scan
- Redémarrez le Pico W si nécessaire

### Données incorrectes
- Vérifiez le câblage (TX du GPS vers RX du Pico)
- Vérifiez le baudrate (9600 par défaut)
- Utilisez le moniteur série de Thonny pour debug

## LED de statut

- **LED éteinte**: Pas de client Bluetooth connecté
- **LED allumée**: Client Bluetooth connecté

## Test avec le moniteur série

Ouvrez Thonny IDE et connectez-vous au Pico W pour voir les logs:
```
========================================
Pico W GPS Bluetooth - FrisTrack
========================================
[BLE] Service GPS initialisé: PicoW-GPS
[GPS] UART initialisé: UART0, TX=GP0, RX=GP1, 9600baud
[MAIN] Démarrage de la boucle principale...
[MAIN] En attente de connexion Bluetooth...
[BLE] Publicité démarrée
[BLE] Client connecté: 0
[GPS] 50.123456, 4.567890 | Alt: 150.0m | Vit: 0.0km/h | Sat: 8
```
