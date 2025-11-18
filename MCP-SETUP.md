# MCP Configuration for VSCode

## Quick Setup

### 1. Local Project Configuration
The `.vscode/mcp.json` file is already configured for this project:

```json
{
  "mcpServers": {
    "universal-graph-intelligence": {
      "command": "node",
      "args": ["dist/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 2. Global VSCode Configuration
For system-wide access, add to your VSCode settings:

**Location**: `~/.config/Code/User/settings.json` (Linux/Mac) or `%APPDATA%\Code\User\settings.json` (Windows)

```json
{
  "mcp.servers": {
    "universal-graph-intelligence": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-graphapi/dist/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 3. Usage in VSCode

1. **Build the server**: `npm run build`
2. **Configure Azure credentials**: Set up `.env` file
3. **Open VSCode** in the project directory
4. **Access MCP**: The server will be available to MCP-compatible extensions

### 4. Verification

Check VSCode's MCP connection:
- Open Command Palette (`Ctrl+Shift+P`)
- Look for MCP-related commands
- Server should appear as "universal-graph-intelligence"

## Available Tools

The MCP server provides 13 tools across:
- **Azure AD** (4 tools): Users, groups, roles
- **Security** (3 tools): Alerts, risks, scores  
- **Intune** (6 tools): Devices, compliance, reports, rings
