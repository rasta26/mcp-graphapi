#!/usr/bin/env node

import { testConnection } from './dist/utils/connectionTest.js';
import { logger } from './dist/utils/logger.js';

console.log('🔗 Testing Universal Graph Intelligence Connection...\n');

// Set debug logging for test
process.env.LOG_LEVEL = 'DEBUG';

try {
  const result = await testConnection();
  
  if (result) {
    console.log('✅ Connection test passed!');
    console.log('🚀 Universal Graph Intelligence is ready for queries');
  } else {
    console.log('❌ Connection test failed');
    console.log('💡 Check your .env file and Azure AD configuration');
  }
} catch (error) {
  logger.error('Connection test error:', error);
  console.log('\n💡 Common issues:');
  console.log('  • Missing .env file with Azure credentials');
  console.log('  • Invalid Azure AD application configuration');
  console.log('  • Missing Microsoft Graph API permissions');
}
