# Azure Graph API MCP Server 🚀
*Where Intune asset management becomes conversational intelligence*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Azure](https://img.shields.io/badge/Microsoft_Azure-0089D0?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/)
[![MCP](https://img.shields.io/badge/MCP-FF6B6B?style=for-the-badge&logo=protocol&logoColor=white)](https://modelcontextprotocol.io/)

## 🌟 The Vision

Transform your Azure Intune infrastructure into an intelligent, conversational interface. This MCP server bridges the gap between Microsoft Graph API and AI assistants, making device management as intuitive as having a conversation with your infrastructure.

## ✨ Features

- 🔍 **Smart Device Discovery** - Find any device instantly by name, email, or ID
- 📊 **Comprehensive Asset Intelligence** - Full device details, compliance status, and sync history
- 📱 **Application Inventory** - Complete mobile app catalog with publisher information
- 🛡️ **Compliance Reporting** - Real-time compliance summaries and insights
- 🔐 **Enterprise Security** - Azure AD authentication with automatic token refresh
- 💬 **Conversational Interface** - Natural language queries through MCP protocol

## 🏗️ Architecture Flow

```mermaid
sequenceDiagram
    participant C as Claude/VSCode
    participant M as MCP Server
    participant A as Azure Auth
    participant G as Graph API
    participant I as Intune

    C->>M: Request device info
    M->>A: Get access token
    A->>A: Check token validity
    alt Token expired
        A->>G: Request new token
        G->>A: Return access token
    end
    A->>M: Return valid token
    M->>G: Query Intune devices
    G->>I: Fetch device data
    I->>G: Return device info
    G->>M: Return formatted data
    M->>C: Deliver insights