import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { intuneService } from './services/intune.js';
import { azureADService } from './services/azuread.js';
import { securityService } from './services/security.js';
import { logger } from './utils/logger.js';
import { testConnection } from './utils/connectionTest.js';

class UniversalGraphMCPServer {
  private server: Server;

  constructor() {
    logger.info('Initializing Universal Graph Intelligence MCP Server');
    this.server = new Server({
      name: 'universal-graph-intelligence',
      version: '2.0.0',
    });

    this.setupToolHandlers();
    logger.debug('Tool handlers configured');
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Intune Tools
        {
          name: 'get_intune_devices',
          description: 'Retrieve all Intune managed devices',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'search_intune_devices',
          description: 'Search Intune devices by name or email',
          inputSchema: {
            type: 'object',
            properties: { query: { type: 'string', description: 'Search query' } },
            required: ['query'],
          },
        },
        {
          name: 'get_compliance_report',
          description: 'Get device compliance summary',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'export_device_report',
          description: 'Export device or compliance report',
          inputSchema: {
            type: 'object',
            properties: { reportType: { type: 'string', description: 'Report type: devices or compliance', enum: ['devices', 'compliance'] } },
          },
        },
        {
          name: 'get_device_rings',
          description: 'Get all device deployment rings',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'lookup_device_ring',
          description: 'Lookup device ring assignments',
          inputSchema: {
            type: 'object',
            properties: { deviceId: { type: 'string', description: 'Device ID' } },
            required: ['deviceId'],
          },
        },
        // Azure AD Tools
        {
          name: 'get_users',
          description: 'Retrieve all Azure AD users',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'search_users',
          description: 'Search Azure AD users by name or email',
          inputSchema: {
            type: 'object',
            properties: { query: { type: 'string', description: 'Search query' } },
            required: ['query'],
          },
        },
        {
          name: 'get_groups',
          description: 'Retrieve all Azure AD groups',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_user_roles',
          description: 'Get user role memberships',
          inputSchema: {
            type: 'object',
            properties: { userId: { type: 'string', description: 'User ID' } },
            required: ['userId'],
          },
        },
        // Security Tools
        {
          name: 'get_security_alerts',
          description: 'Retrieve security alerts and threats',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_risk_detections',
          description: 'Get identity risk detections',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_security_score',
          description: 'Get organization security score',
          inputSchema: { type: 'object', properties: {} },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.debug(`Tool called: ${name}`, args);

      try {
        switch (name) {
          // Intune Cases
          case 'get_intune_devices':
            const devices = await intuneService.getAllDevices();
            return { content: [{ type: 'text', text: `Found ${devices.length} devices:\n\n${this.formatDevices(devices)}` }] };

          case 'search_intune_devices':
            if (!args?.query) throw new Error('Query required');
            const searchResults = await intuneService.searchDevices(args.query as string);
            return { content: [{ type: 'text', text: `Search results:\n\n${this.formatDevices(searchResults)}` }] };

          case 'get_compliance_report':
            const report = await intuneService.getComplianceReport();
            return { content: [{ type: 'text', text: this.formatComplianceReport(report) }] };

          case 'export_device_report':
            const reportType = args?.reportType as string || 'devices';
            const exportResult = await intuneService.exportDeviceReport(reportType);
            return { content: [{ type: 'text', text: this.formatExportResult(exportResult) }] };

          case 'get_device_rings':
            const rings = await intuneService.getDeviceRings();
            return { content: [{ type: 'text', text: `Found ${rings.length} device rings:\n\n${this.formatDeviceRings(rings)}` }] };

          case 'lookup_device_ring':
            if (!args?.deviceId) throw new Error('DeviceId required');
            const ringLookup = await intuneService.lookupDeviceRing(args.deviceId as string);
            return { content: [{ type: 'text', text: this.formatDeviceRingLookup(ringLookup) }] };

          // Azure AD Cases
          case 'get_users':
            const users = await azureADService.getUsers();
            return { content: [{ type: 'text', text: `Found ${users.length} users:\n\n${this.formatUsers(users)}` }] };

          case 'search_users':
            if (!args?.query) throw new Error('Query required');
            const userResults = await azureADService.searchUsers(args.query as string);
            return { content: [{ type: 'text', text: `User search results:\n\n${this.formatUsers(userResults)}` }] };

          case 'get_groups':
            const groups = await azureADService.getGroups();
            return { content: [{ type: 'text', text: `Found ${groups.length} groups:\n\n${this.formatGroups(groups)}` }] };

          case 'get_user_roles':
            if (!args?.userId) throw new Error('UserId required');
            const roles = await azureADService.getUserRoles(args.userId as string);
            return { content: [{ type: 'text', text: `User roles:\n\n${this.formatRoles(roles)}` }] };

          // Security Cases
          case 'get_security_alerts':
            const alerts = await securityService.getSecurityAlerts();
            return { content: [{ type: 'text', text: `Found ${alerts.length} alerts:\n\n${this.formatAlerts(alerts)}` }] };

          case 'get_risk_detections':
            const risks = await securityService.getRiskDetections();
            return { content: [{ type: 'text', text: `Found ${risks.length} risk detections:\n\n${this.formatRisks(risks)}` }] };

          case 'get_security_score':
            const score = await securityService.getSecurityScore();
            return { content: [{ type: 'text', text: this.formatSecurityScore(score) }] };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    });
  }

  private formatDevices(devices: any[]): string {
    return devices.map(d => `📱 ${d.deviceName} (${d.operatingSystem})\n   User: ${d.emailAddress}\n   Compliance: ${d.complianceState}`).join('\n\n');
  }

  private formatUsers(users: any[]): string {
    return users.map(u => `👤 ${u.displayName}\n   Email: ${u.userPrincipalName}\n   Department: ${u.department}\n   Status: ${u.accountEnabled ? 'Active' : 'Disabled'}`).join('\n\n');
  }

  private formatGroups(groups: any[]): string {
    return groups.map(g => `👥 ${g.displayName}\n   Type: ${g.groupTypes.join(', ') || 'Security'}\n   Description: ${g.description || 'No description'}`).join('\n\n');
  }

  private formatRoles(roles: any[]): string {
    return roles.map(r => `🔐 ${r.displayName}\n   Description: ${r.description || 'No description'}`).join('\n\n');
  }

  private formatAlerts(alerts: any[]): string {
    return alerts.map(a => `🚨 ${a.title}\n   Severity: ${a.severity}\n   Status: ${a.status}\n   Created: ${a.createdDateTime}`).join('\n\n');
  }

  private formatRisks(risks: any[]): string {
    return risks.map(r => `⚠️ ${r.riskType}\n   User: ${r.userDisplayName}\n   Level: ${r.riskLevel}\n   State: ${r.riskState}`).join('\n\n');
  }

  private formatSecurityScore(score: any): string {
    return `🛡️ Security Score: ${score.currentScore || 'N/A'}/${score.maxScore || 'N/A'}\n` +
           `Percentage: ${score.averageComparativeScores?.[0]?.averageScore || 'N/A'}%\n` +
           `Last Updated: ${score.createdDateTime || 'N/A'}`;
  }

  private formatComplianceReport(report: any): string {
    return `📊 Compliance Summary:\n` +
           `Compliant: ${report.compliantDeviceCount || 0}\n` +
           `Non-compliant: ${report.nonCompliantDeviceCount || 0}\n` +
           `Error: ${report.errorDeviceCount || 0}\n` +
           `Unknown: ${report.unknownDeviceCount || 0}`;
  }

  private formatExportResult(result: any): string {
    if (result.exportJobId) {
      return `📤 Export initiated:\nJob ID: ${result.exportJobId}\nStatus: ${result.status}`;
    }
    return `📤 Export completed:\nFormat: ${result.format}\nRecords: ${result.data?.length || 0}`;
  }

  private formatDeviceRings(rings: any[]): string {
    return rings.map(r => `🔄 ${r.name}\n   Assignments: ${r.assignmentCount}\n   Created: ${r.createdDateTime}`).join('\n\n');
  }

  private formatDeviceRingLookup(lookup: any): string {
    const ringsText = lookup.assignedRings.map((ring: any) => 
      `  • ${ring.name} (${ring.state})`
    ).join('\n');
    return `🔍 Device: ${lookup.deviceName}\n📍 Assigned Rings:\n${ringsText}`;
  }

  async start() {
    logger.info('Starting Universal Microsoft Graph Intelligence Server');
    
    // Test connection on startup
    const connected = await testConnection();
    if (!connected) {
      logger.warn('Connection test failed - server will start but may have authentication issues');
    }
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Universal Microsoft Graph Intelligence Server running on stdio');
  }
}

const server = new UniversalGraphMCPServer();
server.start().catch(console.error);