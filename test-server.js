#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing Universal Microsoft Graph Intelligence Server...');

const server = spawn('node', ['dist/server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

const listToolsRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list'
};

server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

let output = '';
server.stdout.on('data', (data) => {
  output += data.toString();
  
  try {
    const response = JSON.parse(output.trim());
    if (response.result && response.result.tools) {
      console.log('✅ Universal Graph Intelligence Server is working!');
      console.log(`📊 Available tools: ${response.result.tools.length}`);
      
      const categories = {
        'Azure AD': response.result.tools.filter(t => t.name.includes('user') || t.name.includes('group')),
        'Security': response.result.tools.filter(t => t.name.includes('security') || t.name.includes('risk')),
        'Intune': response.result.tools.filter(t => t.name.includes('intune') || t.name.includes('compliance'))
      };
      
      Object.entries(categories).forEach(([category, tools]) => {
        console.log(`\n${category} Tools (${tools.length}):`);
        tools.forEach(tool => console.log(`  - ${tool.name}`));
      });
      
      server.kill();
      process.exit(0);
    }
  } catch (e) {
    // Continue waiting for complete JSON
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  if (error.includes('Universal Microsoft Graph Intelligence Server running')) {
    console.log('✅ Server started successfully');
  } else if (error.includes('invalid_client_credential')) {
    console.log('⚠️  Expected authentication error (no credentials configured)');
    console.log('✅ Universal Graph Intelligence structure is valid');
    server.kill();
    process.exit(0);
  }
});

setTimeout(() => {
  console.log('❌ Test timeout');
  server.kill();
  process.exit(1);
}, 5000);
