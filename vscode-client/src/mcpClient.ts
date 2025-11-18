import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

export class MCPClient {
  private serverProcess: ChildProcess | null = null;
  private requestId = 1;

  async connect(serverPath: string): Promise<void> {
    this.serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.dirname(serverPath)
    });

    if (!this.serverProcess.stdin || !this.serverProcess.stdout) {
      throw new Error('Failed to create server process');
    }
  }

  async listTools(): Promise<any> {
    return this.sendRequest('tools/list', {});
  }

  async callTool(name: string, args: any = {}): Promise<any> {
    return this.sendRequest('tools/call', { name, arguments: args });
  }

  private async sendRequest(method: string, params: any): Promise<any> {
    if (!this.serverProcess?.stdin || !this.serverProcess?.stdout) {
      throw new Error('Server not connected');
    }

    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      let responseData = '';
      
      const onData = (data: Buffer) => {
        responseData += data.toString();
        try {
          const response = JSON.parse(responseData.trim());
          this.serverProcess!.stdout!.off('data', onData);
          
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.result);
          }
        } catch (e) {
          // Continue accumulating data
        }
      };

      this.serverProcess!.stdout!.on('data', onData);
      this.serverProcess!.stdin!.write(JSON.stringify(request) + '\n');
      
      setTimeout(() => {
        this.serverProcess!.stdout!.off('data', onData);
        reject(new Error('Request timeout'));
      }, 10000);
    });
  }

  disconnect(): void {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }
}
