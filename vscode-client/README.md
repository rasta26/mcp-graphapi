# Universal Graph Intelligence - VSCode Extension

Query your entire Microsoft 365 ecosystem through VSCode with conversational AI.

## Features

- **Quick Query**: `Ctrl+Shift+G` (Cmd+Shift+G on Mac) to instantly query M365
- **Tool Browser**: View all available Azure AD, Security, and Intune tools
- **Markdown Results**: Query results displayed in formatted markdown documents

## Available Queries

### Azure Active Directory
- Get all users
- Search users by name/email
- List groups and roles
- Analyze user permissions

### Security Center  
- View security alerts
- Check risk detections
- Get security score

### Intune Management
- List managed devices
- Search devices
- Export compliance reports
- Manage deployment rings

## Usage

1. **Install Extension**: Load in VSCode
2. **Configure Server**: Ensure Universal Graph Intelligence server is built
3. **Query M365**: Use `Ctrl+Shift+G` or Command Palette
4. **View Results**: Results open in new markdown document

## Commands

- `Universal Graph: Query Microsoft 365` - Interactive query interface
- `Universal Graph: List Available Tools` - Browse all capabilities

## Requirements

- Universal Microsoft Graph Intelligence server (built)
- Azure AD application with proper permissions
- VSCode 1.74.0+
