import axios, { AxiosInstance } from 'axios';
import { azureAuth } from '../auth/azure-auth.js';

export interface User {
  id: string;
  displayName: string;
  userPrincipalName: string;
  mail: string;
  jobTitle: string;
  department: string;
  accountEnabled: boolean;
  lastSignInDateTime: string;
}

export interface Group {
  id: string;
  displayName: string;
  description: string;
  groupTypes: string[];
  membershipRule: string;
}

class AzureADService {
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

  async getUsers(): Promise<User[]> {
    const response = await this.httpClient.get('/users?$select=id,displayName,userPrincipalName,mail,jobTitle,department,accountEnabled,signInActivity');
    return response.data.value.map(this.transformUser);
  }

  async searchUsers(query: string): Promise<User[]> {
    const filter = `startswith(displayName,'${query}') or startswith(userPrincipalName,'${query}')`;
    const response = await this.httpClient.get(`/users?$filter=${encodeURIComponent(filter)}&$select=id,displayName,userPrincipalName,mail,jobTitle,department,accountEnabled`);
    return response.data.value.map(this.transformUser);
  }

  async getGroups(): Promise<Group[]> {
    const response = await this.httpClient.get('/groups?$select=id,displayName,description,groupTypes,membershipRule');
    return response.data.value;
  }

  async getUserRoles(userId: string): Promise<any[]> {
    const response = await this.httpClient.get(`/users/${userId}/memberOf?$select=id,displayName,description`);
    return response.data.value;
  }

  private transformUser(rawUser: any): User {
    return {
      id: rawUser.id,
      displayName: rawUser.displayName || 'Unknown',
      userPrincipalName: rawUser.userPrincipalName || 'Unknown',
      mail: rawUser.mail || 'Unknown',
      jobTitle: rawUser.jobTitle || 'Unknown',
      department: rawUser.department || 'Unknown',
      accountEnabled: rawUser.accountEnabled || false,
      lastSignInDateTime: rawUser.signInActivity?.lastSignInDateTime || 'Unknown',
    };
  }
}

export const azureADService = new AzureADService();
