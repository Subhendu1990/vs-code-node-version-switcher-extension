import { BaseCommand } from './BaseCommand';
import { IVersionManagerService } from '../_contracts/IVersionManagerService';
import { NodeStatusBar } from '../_ui/NodeStatusBar';
import * as vscode from 'vscode';
import { COMMAND_IDS } from '../_constants/commandIds';

export class SelectNodeVersionCommand extends BaseCommand {
  constructor(
    private readonly nodeService: IVersionManagerService,
    private readonly statusBar: NodeStatusBar
  ) {
    super(COMMAND_IDS.SELECT_NODE_VERSION);
  }

  async execute(): Promise<void> {
    if (!this.nodeService.isVersionManagerInstalled()) {
      const choice = await vscode.window.showWarningMessage(
        'nvm is not installed. Install it now?',
        'Install',
        'Cancel'
      );
      if (choice === 'Install') {
        this.nodeService.installVersionManager();
        vscode.window.showInformationMessage('nvm installation script executed. Please restart your terminal.');
      }
      return;
    }

    const currentVersion = this.nodeService.getCurrentNodeVersion();
    const otherversions = this.nodeService.listOtherNodeVersions();

    const items = [
      { label: `$(check) Current: ${currentVersion}`, alwaysShow: true },
      ...otherversions.map(v => ({ label: v })),
      { label: '$(plus) Install New Version', description: 'Install a new Node.js version' }
    ];

    const selection = await vscode.window.showQuickPick(items, { placeHolder: 'Select Node.js version' });
    if (!selection) return;

    if (selection.label.includes('Install New Version')) {
      const newVersion = await vscode.window.showInputBox({ prompt: 'Enter new Node version (e.g., 20 or 20.11.0)' });
      if (newVersion) {
        vscode.window.showInformationMessage(`Started installing Node version ${newVersion}`);
        this.nodeService.installNodeVersion(newVersion);
      }
      return;
    }

    if (!selection.label.includes('Current')) {
      this.nodeService.useNodeVersion(selection.label);
      this.statusBar.update(selection.label);
      vscode.window.showInformationMessage(`Switched to Node version ${selection.label}`);
    }
  }
}
