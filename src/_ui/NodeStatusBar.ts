import * as vscode from 'vscode';

export class NodeStatusBar {
  private readonly item: vscode.StatusBarItem;

  constructor(commandId: string, initialVersion: string) {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.item.command = commandId;
    this.item.text = `$(versions) Node: ${initialVersion}`;
    this.item.show();
  }

  update(version: string): void {
    this.item.text = `$(versions) Node: ${version}`;
  }

  dispose(): void {
    this.item.dispose();
  }
}
