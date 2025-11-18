import axios, { AxiosInstance } from 'axios';
import { azureAuth } from '../auth/azure-auth.js';

export interface SecurityAlert {
  id: string;
  title: string;
  severity: string;
  status: string;
  category: string;
  createdDateTime: string;
  description: string;
}

export interface RiskDetection {
  id: string;
  userId: string;
  userDisplayName: string;
  riskType: string;
  riskLevel: string;
  riskState: string;
  detectedDateTime: string;
}

class SecurityService {
  private httpClient: AxiosInstance;
  private readonly baseUrl = 'https://graph.microsoft.com/v1.0';

  constructor() {
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });

    this.httpClient.interceptors.request.use(async (config) => {
      const token = await azureAuth.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    const response = await this.httpClient.get('/security/alerts_v2?$top=50');
    return response.data.value.map(this.transformAlert);
  }

  async getRiskDetections(): Promise<RiskDetection[]> {
    const response = await this.httpClient.get('/identityProtection/riskDetections?$top=50');
    return response.data.value.map(this.transformRiskDetection);
  }

  async getSecurityScore(): Promise<any> {
    const response = await this.httpClient.get('/security/secureScores?$top=1');
    return response.data.value[0] || {};
  }

  async getCompliancePolicies(): Promise<any[]> {
    const response = await this.httpClient.get('/deviceManagement/deviceCompliancePolicies');
    return response.data.value;
  }

  private transformAlert(rawAlert: any): SecurityAlert {
    return {
      id: rawAlert.id,
      title: rawAlert.title || 'Unknown',
      severity: rawAlert.severity || 'Unknown',
      status: rawAlert.status || 'Unknown',
      category: rawAlert.category || 'Unknown',
      createdDateTime: rawAlert.createdDateTime || 'Unknown',
      description: rawAlert.description || 'No description',
    };
  }

  private transformRiskDetection(rawRisk: any): RiskDetection {
    return {
      id: rawRisk.id,
      userId: rawRisk.userId || 'Unknown',
      userDisplayName: rawRisk.userDisplayName || 'Unknown',
      riskType: rawRisk.riskType || 'Unknown',
      riskLevel: rawRisk.riskLevel || 'Unknown',
      riskState: rawRisk.riskState || 'Unknown',
      detectedDateTime: rawRisk.detectedDateTime || 'Unknown',
    };
  }
}

export const securityService = new SecurityService();
