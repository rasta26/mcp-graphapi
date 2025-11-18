import axios, { AxiosInstance } from 'axios';
import { azureAuth } from '../auth/azure-auth.js';

export interface IntuneDevice {
  id: string;
  deviceName: string;
  operatingSystem: string;
  osVersion: string;
  emailAddress: string;
  userId: string;
  deviceEnrollmentType: string;
  managementState: string;
  complianceState: string;
  lastSyncDateTime: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
}

export interface IntuneApplication {
  id: string;
  displayName: string;
  publisher: string;
  largeIcon?: {
    value: string;
  };
}

class IntuneService {
  private httpClient: AxiosInstance;
  private readonly baseUrl = 'https://graph.microsoft.com/v1.0';

  constructor() {
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });

    // The authentication interceptor - elegant and automatic
    this.httpClient.interceptors.request.use(async (config) => {
      const token = await azureAuth.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async getAllDevices(): Promise<IntuneDevice[]> {
    try {
      const response = await this.httpClient.get('/deviceManagement/managedDevices');
      return response.data.value.map(this.transformDevice);
    } catch (error) {
      throw new Error(`Failed to fetch devices: ${error}`);
    }
  }

  async getDeviceById(deviceId: string): Promise<IntuneDevice | null> {
    try {
      const response = await this.httpClient.get(`/deviceManagement/managedDevices/${deviceId}`);
      return this.transformDevice(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch device: ${error}`);
    }
  }

  async searchDevices(query: string): Promise<IntuneDevice[]> {
    try {
      const filter = `startswith(deviceName,'${query}') or startswith(emailAddress,'${query}')`;
      const response = await this.httpClient.get(`/deviceManagement/managedDevices?$filter=${encodeURIComponent(filter)}`);
      return response.data.value.map(this.transformDevice);
    } catch (error) {
      throw new Error(`Failed to search devices: ${error}`);
    }
  }

  async getApplications(): Promise<IntuneApplication[]> {
    try {
      const response = await this.httpClient.get('/deviceAppManagement/mobileApps');
      return response.data.value;
    } catch (error) {
      throw new Error(`Failed to fetch applications: ${error}`);
    }
  }

  async getComplianceReport(): Promise<any> {
    try {
      const response = await this.httpClient.get('/deviceManagement/deviceCompliancePolicyDeviceStateSummary');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch compliance report: ${error}`);
    }
  }

  private transformDevice(rawDevice: any): IntuneDevice {
    return {
      id: rawDevice.id,
      deviceName: rawDevice.deviceName || 'Unknown',
      operatingSystem: rawDevice.operatingSystem || 'Unknown',
      osVersion: rawDevice.osVersion || 'Unknown',
      emailAddress: rawDevice.emailAddress || 'Unknown',
      userId: rawDevice.userId || 'Unknown',
      deviceEnrollmentType: rawDevice.deviceEnrollmentType || 'Unknown',
      managementState: rawDevice.managementState || 'Unknown',
      complianceState: rawDevice.complianceState || 'Unknown',
      lastSyncDateTime: rawDevice.lastSyncDateTime || 'Unknown',
      manufacturer: rawDevice.manufacturer || 'Unknown',
      model: rawDevice.model || 'Unknown',
      serialNumber: rawDevice.serialNumber || 'Unknown',
    };
  }
}

export const intuneService = new IntuneService();