import { strict as assert } from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { SelectNodeVersionCommand } from '../../../_commands/SelectNodeVersionCommand';
import { IVersionManagerService } from '../../../_contracts/IVersionManagerService';
import { NodeStatusBar } from '../../../_ui/NodeStatusBar';

suite('SelectNodeVersionCommand Test Suite', () => {
  let command: SelectNodeVersionCommand;
  let mockNodeService: sinon.SinonStubbedInstance<IVersionManagerService>;
  let mockStatusBar: sinon.SinonStubbedInstance<NodeStatusBar>;
  let showWarningMessageStub: sinon.SinonStub;
  let showInformationMessageStub: sinon.SinonStub;
  let showQuickPickStub: sinon.SinonStub;
  let showInputBoxStub: sinon.SinonStub;

  setup(() => {
    mockNodeService = {
      isVersionManagerInstalled: sinon.stub(),
      installVersionManager: sinon.stub(),
      getCurrentNodeVersion: sinon.stub(),
      listNodeVersions: sinon.stub(),
      listOtherNodeVersions: sinon.stub(),
      useNodeVersion: sinon.stub(),
      installNodeVersion: sinon.stub()
    };

    mockStatusBar = {
      update: sinon.stub(),
      dispose: sinon.stub()
    } as any;

    command = new SelectNodeVersionCommand(mockNodeService, mockStatusBar);

    showWarningMessageStub = sinon.stub(vscode.window, 'showWarningMessage');
    showInformationMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
    showQuickPickStub = sinon.stub(vscode.window, 'showQuickPick');
    showInputBoxStub = sinon.stub(vscode.window, 'showInputBox');
  });

  teardown(() => {
    sinon.restore();
  });

  suite('NVM Not Installed Scenarios', () => {
    test('should show warning when nvm is not installed', async () => {
      mockNodeService.isVersionManagerInstalled.returns(false);
      showWarningMessageStub.resolves('Cancel');

      await command.execute();

      assert(showWarningMessageStub.calledOnce);
      assert(showWarningMessageStub.calledWith(
        'nvm is not installed. Install it now?',
        'Install',
        'Cancel'
      ));
    });

    test('should install nvm when user chooses Install', async () => {
      mockNodeService.isVersionManagerInstalled.returns(false);
      showWarningMessageStub.resolves('Install');

      await command.execute();

      assert(mockNodeService.installVersionManager.calledOnce);
      assert(showInformationMessageStub.calledWith(
        'nvm installation script executed. Please restart your terminal.'
      ));
    });

    test('should not install nvm when user chooses Cancel', async () => {
      mockNodeService.isVersionManagerInstalled.returns(false);
      showWarningMessageStub.resolves('Cancel');

      await command.execute();

      assert(mockNodeService.installVersionManager.notCalled);
    });

    test('should handle undefined choice', async () => {
      mockNodeService.isVersionManagerInstalled.returns(false);
      showWarningMessageStub.resolves(undefined);

      await command.execute();

      assert(mockNodeService.installVersionManager.notCalled);
    });
  });

  suite('NVM Installed Scenarios', () => {
    setup(() => {
      mockNodeService.isVersionManagerInstalled.returns(true);
    });

    test('should show quick pick with current and other versions', async () => {
      mockNodeService.getCurrentNodeVersion.returns('20.11.0');
      mockNodeService.listOtherNodeVersions.returns(['18.19.0', '21.5.0']);
      showQuickPickStub.resolves(undefined);

      await command.execute();

      assert(showQuickPickStub.calledOnce);
      const quickPickItems = showQuickPickStub.getCall(0).args[0];
      
      assert.strictEqual(quickPickItems.length, 4);
      assert.strictEqual(quickPickItems[0].label, '$(check) Current: 20.11.0');
      assert.strictEqual(quickPickItems[1].label, '18.19.0');
      assert.strictEqual(quickPickItems[2].label, '21.5.0');
      assert.strictEqual(quickPickItems[3].label, '$(plus) Install New Version');
    });

    test('should not proceed when no selection is made', async () => {
      mockNodeService.getCurrentNodeVersion.returns('20.11.0');
      mockNodeService.listOtherNodeVersions.returns(['18.19.0']);
      showQuickPickStub.resolves(undefined);

      await command.execute();

      assert(mockNodeService.useNodeVersion.notCalled);
      assert(mockStatusBar.update.notCalled);
    });

    test('should switch to selected version', async () => {
      mockNodeService.getCurrentNodeVersion.returns('20.11.0');
      mockNodeService.listOtherNodeVersions.returns(['18.19.0', '21.5.0']);
      showQuickPickStub.resolves({ label: '18.19.0' });

      await command.execute();

      assert(mockNodeService.useNodeVersion.calledWith('18.19.0'));
      assert(mockStatusBar.update.calledWith('18.19.0'));
      assert(showInformationMessageStub.calledWith('Switched to Node version 18.19.0'));
    });

    test('should not switch when current version is selected', async () => {
      mockNodeService.getCurrentNodeVersion.returns('20.11.0');
      mockNodeService.listOtherNodeVersions.returns(['18.19.0']);
      showQuickPickStub.resolves({ label: '$(check) Current: 20.11.0' });

      await command.execute();

      assert(mockNodeService.useNodeVersion.notCalled);
      assert(mockStatusBar.update.notCalled);
    });

    test('should handle install new version selection', async () => {
      mockNodeService.getCurrentNodeVersion.returns('20.11.0');
      mockNodeService.listOtherNodeVersions.returns(['18.19.0']);
      showQuickPickStub.resolves({ 
        label: '$(plus) Install New Version',
        description: 'Install a new Node.js version' 
      });
      showInputBoxStub.resolves('19.9.0');

      await command.execute();

      assert(showInputBoxStub.calledWith({
        prompt: 'Enter new Node version (e.g., 20 or 20.11.0)'
      }));
      assert(mockNodeService.installNodeVersion.calledWith('19.9.0'));
      assert(showInformationMessageStub.calledWith('Started installing Node version 19.9.0'));
    });

    test('should handle install new version with major version only', async () => {
      mockNodeService.getCurrentNodeVersion.returns('20.11.0');
      mockNodeService.listOtherNodeVersions.returns(['18.19.0']);
      showQuickPickStub.resolves({ 
        label: '$(plus) Install New Version',
        description: 'Install a new Node.js version' 
      });
      showInputBoxStub.resolves('21');

      await command.execute();

      assert(mockNodeService.installNodeVersion.calledWith('21'));
      assert(showInformationMessageStub.calledWith('Started installing Node version 21'));
    });

    test('should not install when no version is entered', async () => {
      mockNodeService.getCurrentNodeVersion.returns('20.11.0');
      mockNodeService.listOtherNodeVersions.returns(['18.19.0']);
      showQuickPickStub.resolves({ 
        label: '$(plus) Install New Version',
        description: 'Install a new Node.js version' 
      });
      showInputBoxStub.resolves(undefined);

      await command.execute();

      assert(mockNodeService.installNodeVersion.notCalled);
    });

    test('should not install when empty string is entered', async () => {
      mockNodeService.getCurrentNodeVersion.returns('20.11.0');
      mockNodeService.listOtherNodeVersions.returns(['18.19.0']);
      showQuickPickStub.resolves({ 
        label: '$(plus) Install New Version',
        description: 'Install a new Node.js version' 
      });
      showInputBoxStub.resolves('');

      await command.execute();

      assert(mockNodeService.installNodeVersion.notCalled);
    });
  });

  suite('Edge Cases', () => {
    test('should handle when no other versions are available', async () => {
      mockNodeService.isVersionManagerInstalled.returns(true);
      mockNodeService.getCurrentNodeVersion.returns('20.11.0');
      mockNodeService.listOtherNodeVersions.returns([]);
      showQuickPickStub.resolves(undefined);

      await command.execute();

      const quickPickItems = showQuickPickStub.getCall(0).args[0];
      assert.strictEqual(quickPickItems.length, 2); // Current + Install New
      assert.strictEqual(quickPickItems[0].label, '$(check) Current: 20.11.0');
      assert.strictEqual(quickPickItems[1].label, '$(plus) Install New Version');
    });

    test('should handle when current version is "Not Available"', async () => {
      mockNodeService.isVersionManagerInstalled.returns(true);
      mockNodeService.getCurrentNodeVersion.returns('Not Available');
      mockNodeService.listOtherNodeVersions.returns(['18.19.0', '20.11.0']);
      showQuickPickStub.resolves(undefined);

      await command.execute();

      const quickPickItems = showQuickPickStub.getCall(0).args[0];
      assert.strictEqual(quickPickItems[0].label, '$(check) Current: Not Available');
    });
  });

  suite('Command Registration', () => {
    test('should register with correct command ID', () => {
      const registerStub = sinon.stub(vscode.commands, 'registerCommand');
      
      command.register();
      
      assert(registerStub.calledWith('extension.selectNodeVersion'));
      registerStub.restore();
    });
  });
});
