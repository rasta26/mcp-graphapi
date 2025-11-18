import { azureAuth } from '../auth/azure-auth.js';
import { logger } from './logger.js';

export async function testConnection(): Promise<boolean> {
  try {
    logger.info('Testing Azure Graph API connection...');
    
    const token = await azureAuth.getAccessToken();
    logger.debug('Access token acquired successfully');
    
    // Simple test call to verify connectivity
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      logger.info('Connection test successful');
      return true;
    } else {
      logger.warn(`Connection test failed: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logger.error('Connection test failed:', error);
    return false;
  }
}
