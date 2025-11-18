import * as vscode from 'vscode';
import * as path from 'path';
import { MCPClient } from './mcpClient';

let mcpClient: MCPClient;

export function activate(context: vscode.ExtensionContext) {
  mcpClient = new MCPClient();
  
  // Connect to server on activation
  const serverPath = path.join(__dirname, '../../dist/server.js');
  mcpClient.connect(serverPath).catch(err => {
    vscode.window.showErrorMessage(`Failed to connect to Universal Graph Intelligence: ${err.message}`);
  });

  // Register query command
  const queryCommand = vscode.commands.registerCommand('universalGraph.query', async () => {
    try {
      const tools = await mcpClient.listTools();
      const toolNames = tools.tools.map((t: any) => `${t.name}: ${t.description}`);
      
      const selectedTool = await vscode.window.showQuickPick(toolNames, {
        placeHolder: 'Select a Microsoft 365 query'
      });
      
      if (selectedTool) {
        const toolName = selectedTool.split(':')[0];
        const tool = tools.tools.find((t: any) => t.name === toolName);
        
        let args = {};
        if (tool.inputSchema.required?.length > 0) {
          const input = await vscode.window.showInputBox({
            placeHolder: `Enter ${tool.inputSchema.required[0]} (required)`
          });
          if (!input) return;
          args = { [tool.inputSchema.required[0]]: input };
        }
        
        const result = await mcpClient.callTool(toolName, args);
        const content = result.content[0].text;
        
        // Show result in new document
        const doc = await vscode.workspace.openTextDocument({
          content: `# ${tool.description}\n\n${content}`,
          language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Query failed: ${error}`);
    }
  });

  // Register list tools command
  const listCommand = vscode.commands.registerCommand('universalGraph.listTools', async () => {
    try {
      const tools = await mcpClient.listTools();
      const categories = {
        'Azure AD': tools.tools.filter((t: any) => t.name.includes('user') || t.name.includes('group')),
        'Security': tools.tools.filter((t: any) => t.name.includes('security') || t.name.includes('risk')),
        'Intune': tools.tools.filter((t: any) => t.name.includes('intune') || t.name.includes('device') || t.name.includes('compliance'))
      };
      
      let content = '# Universal Microsoft Graph Intelligence\n\n';
      Object.entries(categories).forEach(([category, categoryTools]) => {
        content += `## ${category} (${categoryTools.length} tools)\n\n`;
        categoryTools.forEach((tool: any) => {
          content += `- **${tool.name}**: ${tool.description}\n`;
        });
        content += '\n';
      });
      
      const doc = await vscode.workspace.openTextDocument({
        content,
        language: 'markdown'
      });
      await vscode.window.showTextDocument(doc);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to list tools: ${error}`);
    }
  });

  context.subscriptions.push(queryCommand, listCommand);
}

export function deactivate() {
  if (mcpClient) {
    mcpClient.disconnect();
  }
}
