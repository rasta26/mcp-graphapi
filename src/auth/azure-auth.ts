import { ConfidentialClientApplication } from '@azure/msal-node';
import { config } from 'dotenv';

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
      return this.accessToken!;
    }

    try {
      const clientCredentialRequest = {
        scopes: ['https://graph.microsoft.com/.default'],
      };

      const response = await this.msalInstance.acquireTokenByClientCredential(clientCredentialRequest);
      
      if (!response) {
        throw new Error('No response received from authentication service');
      }
      
      this.accessToken = response.accessToken;
      this.tokenExpiry = response.expiresOn || new Date(Date.now() + 3600000);
      
      return this.accessToken;
    } catch (error) {
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