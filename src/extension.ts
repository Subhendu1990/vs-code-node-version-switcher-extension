import * as vscode from 'vscode';
import { ShellService } from './_services/ShellService';
import { NvmService } from './_services/NvmService';
import { SelectNodeVersionCommand } from './_commands/SelectNodeVersionCommand';
import { NodeStatusBar } from './_ui/NodeStatusBar';

export function activate(context: vscode.ExtensionContext): void {
  const shellService = new ShellService();
  const nodeService = new NvmService(shellService);

  const currentVersion = nodeService.getCurrentNodeVersion();
  const statusBar = new NodeStatusBar('extension.selectNodeVersion', currentVersion);

  const command = new SelectNodeVersionCommand(nodeService, statusBar);

  const onWindowFocusChange = vscode.window.onDidChangeWindowState((windowState) => {
  if (windowState.focused) {
    const currentVersion = nodeService.getCurrentNodeVersion();
    statusBar.update(currentVersion); // Re-fetch and update version
  }
});

  context.subscriptions.push(command.register(), statusBar, onWindowFocusChange);
}

export function deactivate(): void {
  // No specific cleanup needed.
}
