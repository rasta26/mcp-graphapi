import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { intuneService } from './services/intune.js';

class AzureGraphMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'azure-graph-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools - our capability manifest
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_all_intune_devices',
          description: 'Retrieve all Intune managed devices with comprehensive details',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'search_intune_devices',
          description: 'Search Intune devices by name or email address',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for device name or email',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_intune_device',
          description: 'Get detailed information about a specific Intune device',
          inputSchema: {
            type: 'object',
            properties: {
              deviceId: {
                type: 'string',
                description: 'The unique identifier of the device',
              },
            },
            required: ['deviceId'],
          },
        },
        {
          name: 'get_intune_applications',
          description: 'Retrieve all mobile applications managed by Intune',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_compliance_report',
          description: 'Get device compliance summary report',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // Handle tool calls - where magic happens
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_all_intune_devices':
            const devices = await intuneService.getAllDevices();
            return {
              content: [
                {
                  type: 'text',
                  text: `Found ${devices.length} Intune managed devices:\n\n${this.formatDevices(devices)}`,
                },
              ],
            };

          case 'search_intune_devices':
            const searchResults = await intuneService.searchDevices(args.query as string);
            return {
              content: [
                {
                  type: 'text',
                  text: `Search results for "${args.query}":\n\n${this.formatDevices(searchResults)}`,
                },
              ],
            };

          case 'get_intune_device':
            const device = await intuneService.getDeviceById(args.deviceId as string);
            return {
              content: [
                {
                  type: 'text',
                  text: device 
                    ? this.formatDeviceDetails(device)
                    : `Device with ID ${args.deviceId} not found.`,
                },
              ],
            };

          case 'get_intune_applications':
            const applications = await intuneService.getApplications();
            return {
              content: [
                {
                  type: 'text',
                  text: `Found ${applications.length} applications:\n\n${this.formatApplications(applications)}`,
                },
              ],
            };

          case 'get_compliance_report':
            const report = await intuneService.getComplianceReport();
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatComplianceReport(report),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private formatDevices(devices: any[]): string {
    return devices.map(device => 
      `📱 ${device.deviceName} (${device.operatingSystem})\n` +
      `   User: ${device.emailAddress}\n` +
      `   Compliance: ${device.complianceState}\n` +
      `   Last Sync: ${device.lastSyncDateTime}\n`
    ).join('\n');
  }

  private formatDeviceDetails(device: any): string {
    return `🔍 Device Details:\n\n` +
      `Name: ${device.deviceName}\n` +
      `OS: ${device.operatingSystem} ${device.osVersion}\n` +
      `User: ${device.emailAddress}\n` +
      `Manufacturer: ${device.manufacturer}\n` +
      `Model: ${device.model}\n` +
      `Serial: ${device.serialNumber}\n` +
      `Compliance: ${device.complianceState}\n` +
      `Management State: ${device.managementState}\n` +
      `Enrollment Type: ${device.deviceEnrollmentType}\n` +
      `Last Sync: ${device.lastSyncDateTime}`;
  }

  private formatApplications(applications: any[]): string {
    return applications.map(app => 
      `📱 ${app.displayName}\n   Publisher: ${app.publisher || 'Unknown'}`
    ).join('\n');
  }

  private formatComplianceReport(report: any): string {
    return `📊 Compliance Summary:\n\n` +
      `Compliant Devices: ${report.compliantDeviceCount || 0}\n` +
      `Non-compliant Devices: ${report.nonCompliantDeviceCount || 0}\n` +
      `Error Devices: ${report.errorDeviceCount || 0}\n` +
      `Unknown Devices: ${report.unknownDeviceCount || 0}`;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Azure Graph MCP Server running on stdio');
  }