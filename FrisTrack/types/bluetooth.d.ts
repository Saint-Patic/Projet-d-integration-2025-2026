// Déclarations de types pour les modules sans types natifs

declare module 'react-native-ble-plx' {
  export enum State {
    Unknown = 'Unknown',
    Resetting = 'Resetting',
    Unsupported = 'Unsupported',
    Unauthorized = 'Unauthorized',
    PoweredOff = 'PoweredOff',
    PoweredOn = 'PoweredOn',
  }

  export interface BleError {
    message: string;
    errorCode: number;
  }

  export interface Characteristic {
    uuid: string;
    value: string | null;
    isNotifiable: boolean;
    isReadable: boolean;
    isWritableWithResponse: boolean;
    isWritableWithoutResponse: boolean;
    monitor(
      listener: (error: BleError | null, characteristic: Characteristic | null) => void
    ): { remove: () => void };
    read(): Promise<Characteristic>;
    writeWithResponse(value: string): Promise<Characteristic>;
    writeWithoutResponse(value: string): Promise<Characteristic>;
  }

  export interface Service {
    uuid: string;
    deviceID: string;
    isPrimary: boolean;
    characteristics(): Promise<Characteristic[]>;
  }

  export interface Device {
    id: string;
    name: string | null;
    rssi: number | null;
    mtu: number;
    manufacturerData: string | null;
    serviceData: { [key: string]: string } | null;
    serviceUUIDs: string[] | null;
    localName: string | null;
    txPowerLevel: number | null;
    isConnectable: boolean | null;
    overflowServiceUUIDs: string[] | null;

    connect(options?: { timeout?: number; autoConnect?: boolean }): Promise<Device>;
    cancelConnection(): Promise<Device>;
    isConnected(): Promise<boolean>;
    discoverAllServicesAndCharacteristics(): Promise<Device>;
    services(): Promise<Service[]>;
    characteristicsForService(serviceUUID: string): Promise<Characteristic[]>;
    readCharacteristicForService(
      serviceUUID: string,
      characteristicUUID: string
    ): Promise<Characteristic>;
    writeCharacteristicWithResponseForService(
      serviceUUID: string,
      characteristicUUID: string,
      value: string
    ): Promise<Characteristic>;
    writeCharacteristicWithoutResponseForService(
      serviceUUID: string,
      characteristicUUID: string,
      value: string
    ): Promise<Characteristic>;
    monitorCharacteristicForService(
      serviceUUID: string,
      characteristicUUID: string,
      listener: (error: BleError | null, characteristic: Characteristic | null) => void
    ): { remove: () => void };
    onDisconnected(
      listener: (error: BleError | null, device: Device | null) => void
    ): { remove: () => void };
  }

  export interface ScanOptions {
    allowDuplicates?: boolean;
    scanMode?: number;
    callbackType?: number;
  }

  export class BleManager {
    constructor();
    destroy(): void;
    state(): Promise<State>;
    onStateChange(
      listener: (state: State) => void,
      emitCurrentState?: boolean
    ): { remove: () => void };
    startDeviceScan(
      UUIDs: string[] | null,
      options: ScanOptions | null,
      listener: (error: BleError | null, device: Device | null) => void
    ): void;
    stopDeviceScan(): void;
    requestConnectionPriorityForDevice(
      deviceIdentifier: string,
      connectionPriority: number
    ): Promise<Device>;
    readRSSIForDevice(deviceIdentifier: string): Promise<Device>;
    requestMTUForDevice(deviceIdentifier: string, mtu: number): Promise<Device>;
    connectedDevices(serviceUUIDs: string[]): Promise<Device[]>;
    devices(deviceIdentifiers: string[]): Promise<Device[]>;
    connectToDevice(
      deviceIdentifier: string,
      options?: { timeout?: number; autoConnect?: boolean }
    ): Promise<Device>;
    cancelDeviceConnection(deviceIdentifier: string): Promise<Device>;
    isDeviceConnected(deviceIdentifier: string): Promise<boolean>;
    discoverAllServicesAndCharacteristicsForDevice(
      deviceIdentifier: string
    ): Promise<Device>;
    servicesForDevice(deviceIdentifier: string): Promise<Service[]>;
    characteristicsForDevice(
      deviceIdentifier: string,
      serviceUUID: string
    ): Promise<Characteristic[]>;
  }
}

declare module 'expo-device' {
  export const isDevice: boolean;
  export const brand: string | null;
  export const manufacturer: string | null;
  export const modelName: string | null;
  export const modelId: string | null;
  export const designName: string | null;
  export const productName: string | null;
  export const deviceYearClass: number | null;
  export const totalMemory: number | null;
  export const supportedCpuArchitectures: string[] | null;
  export const osName: string | null;
  export const osVersion: string | null;
  export const osBuildId: string | null;
  export const osInternalBuildId: string | null;
  export const platformApiLevel: number | null;
  export const deviceName: string | null;
  
  export enum DeviceType {
    UNKNOWN = 0,
    PHONE = 1,
    TABLET = 2,
    DESKTOP = 3,
    TV = 4,
  }
  
  export const deviceType: DeviceType | null;
  export function getDeviceTypeAsync(): Promise<DeviceType>;
  export function getUptimeAsync(): Promise<number>;
  export function getMaxMemoryAsync(): Promise<number>;
  export function isRootedExperimentalAsync(): Promise<boolean>;
  export function isSideLoadingEnabledAsync(): Promise<boolean>;
}

declare module 'base-64' {
  export function encode(input: string): string;
  export function decode(input: string): string;
}
