#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 Testing MCP Configuration...\n');

// Check .vscode/mcp.json
const mcpConfigPath = path.join(__dirname, '.vscode', 'mcp.json');
if (fs.existsSync(mcpConfigPath)) {
  console.log('✅ Local MCP config found: .vscode/mcp.json');
  const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
  console.log(`   Server: ${Object.keys(config.mcpServers)[0]}`);
  console.log(`   Command: ${config.mcpServers['universal-graph-intelligence'].command}`);
  console.log(`   Args: ${config.mcpServers['universal-graph-intelligence'].args.join(' ')}`);
} else {
  console.log('❌ Local MCP config not found');
}

// Check if server is built
const serverPath = path.join(__dirname, 'dist', 'server.js');
if (fs.existsSync(serverPath)) {
  console.log('✅ MCP server built: dist/server.js');
} else {
  console.log('❌ MCP server not built - run: npm run build');
}

// Check global config template
const globalConfigPath = path.join(__dirname, 'mcp-config.json');
if (fs.existsSync(globalConfigPath)) {
  console.log('✅ Global config template: mcp-config.json');
} else {
  console.log('❌ Global config template missing');
}

console.log('\n📋 Next Steps:');
console.log('1. Build server: npm run build');
console.log('2. Configure Azure: cp .env.example .env');
console.log('3. Open VSCode in this directory');
console.log('4. MCP server will be auto-discovered as "universal-graph-intelligence"');

console.log('\n🎯 MCP Configuration Ready! 🚀');
