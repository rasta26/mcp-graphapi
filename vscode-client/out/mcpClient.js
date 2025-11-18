"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClient = void 0;
const child_process_1 = require("child_process");
const path = require("path");
class MCPClient {
    constructor() {
        this.serverProcess = null;
        this.requestId = 1;
    }
    async connect(serverPath) {
        this.serverProcess = (0, child_process_1.spawn)('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: path.dirname(serverPath)
        });
        if (!this.serverProcess.stdin || !this.serverProcess.stdout) {
            throw new Error('Failed to create server process');
        }
    }
    async listTools() {
        return this.sendRequest('tools/list', {});
    }
    async callTool(name, args = {}) {
        return this.sendRequest('tools/call', { name, arguments: args });
    }
    async sendRequest(method, params) {
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
            const onData = (data) => {
                responseData += data.toString();
                try {
                    const response = JSON.parse(responseData.trim());
                    this.serverProcess.stdout.off('data', onData);
                    if (response.error) {
                        reject(new Error(response.error.message));
                    }
                    else {
                        resolve(response.result);
                    }
                }
                catch (e) {
                    // Continue accumulating data
                }
            };
            this.serverProcess.stdout.on('data', onData);
            this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
            setTimeout(() => {
                this.serverProcess.stdout.off('data', onData);
                reject(new Error('Request timeout'));
            }, 10000);
        });
    }
    disconnect() {
        if (this.serverProcess) {
            this.serverProcess.kill();
            this.serverProcess = null;
        }
    }
}
exports.MCPClient = MCPClient;
//# sourceMappingURL=mcpClient.js.map