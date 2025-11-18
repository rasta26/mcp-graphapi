export interface AzureConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  authority: string;
}

export interface ComplianceReport {
  compliantDeviceCount: number;
  nonCompliantDeviceCount: number;
  errorDeviceCount: number;
  unknownDeviceCount: number;
}