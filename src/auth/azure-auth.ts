import { ConfidentialClientApplication } from '@azure/msal-node';
import { config } from 'dotenv';
import { logger } from '../utils/logger.js';

config();

interface AzureConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  authority: string;
}

class AzureAuthenticator {
  private msalInstance: ConfidentialClientApplication;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private config: AzureConfig) {
    this.msalInstance = new ConfidentialClientApplication({
      auth: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        authority: config.authority,
      },
    });
  }

  async getAccessToken(): Promise<string> {
    if (this.isTokenValid()) {
      logger.debug('Using cached access token');
      return this.accessToken!;
    }

    try {
      logger.debug('Acquiring new access token');
      const clientCredentialRequest = {
        scopes: ['https://graph.microsoft.com/.default'],
      };

      const response = await this.msalInstance.acquireTokenByClientCredential(clientCredentialRequest);
      
      if (!response) {
        throw new Error('No response received from authentication service');
      }
      
      this.accessToken = response.accessToken;
      this.tokenExpiry = response.expiresOn || new Date(Date.now() + 3600000);
      
      logger.info('Access token acquired successfully');
      return this.accessToken;
    } catch (error) {
      logger.error('Authentication failed:', error);
      throw new Error(`Authentication failed: ${error}`);
    }
  }

  private isTokenValid(): boolean {
    return !!(
      this.accessToken && 
      this.tokenExpiry && 
      this.tokenExpiry.getTime() > Date.now() + 60000 // 1 minute buffer
    );
  }
}

export const azureAuth = new AzureAuthenticator({
  clientId: process.env.AZURE_CLIENT_ID!,
  clientSecret: process.env.AZURE_CLIENT_SECRET!,
  tenantId: process.env.AZURE_TENANT_ID!,
  authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
});