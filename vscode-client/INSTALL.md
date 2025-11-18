# VSCode Extension Installation Guide

## Quick Setup

1. **Build the MCP Server**:
   ```bash
   cd /path/to/mcp-graphapi
   npm run build
   ```

2. **Install Extension Dependencies**:
   ```bash
   cd vscode-client
   npm install
   npm run compile
   ```

3. **Load in VSCode**:
   - Open VSCode
   - Press `F1` → "Developer: Install Extension from Location"
   - Select the `vscode-client` folder
   - Reload VSCode

4. **Test the Extension**:
   - Press `Ctrl+Shift+G` (or `Cmd+Shift+G`)
   - Select a query from the dropdown
   - View results in markdown document

## Usage Examples

### Query Users
1. `Ctrl+Shift+G` → Select "search_users"
2. Enter search term (e.g., "john")
3. View user results with details

### Check Security
1. `Ctrl+Shift+G` → Select "get_security_alerts"
2. View current security threats and alerts

### Device Management
1. `Ctrl+Shift+G` → Select "get_intune_devices"
2. See all managed devices with compliance status

## Troubleshooting

**Extension not loading**: Ensure server is built (`npm run build`)
**Connection failed**: Check server path in extension.ts
**No results**: Verify Azure credentials in .env file
