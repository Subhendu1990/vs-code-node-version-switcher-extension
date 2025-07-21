import { strict as assert } from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { activate, deactivate } from '../../extension';
import { ShellService } from '../../_services/ShellService';
import { NvmService } from '../../_services/NvmService';

suite('Extension Test Suite', () => {
  let mockContext: vscode.ExtensionContext;
  let shellServiceStub: sinon.SinonStubbedInstance<ShellService>;
  let nvmServiceStub: sinon.SinonStubbedInstance<NvmService>;

  setup(() => {
    mockContext = {
      subscriptions: [],
      workspaceState: {
        get: sinon.stub(),
        update: sinon.stub(),
        keys: sinon.stub().returns([])
      },
      globalState: {
        get: sinon.stub(),
        update: sinon.stub(),
        setKeysForSync: sinon.stub(),
        keys: sinon.stub().returns([])
      },
      extensionUri: vscode.Uri.parse('file:///test'),
      extensionPath: '/test',
      environmentVariableCollection: {
        persistent: true,
        replace: sinon.stub(),
        append: sinon.stub(),
        prepend: sinon.stub(),
        get: sinon.stub(),
        forEach: sinon.stub(),
        delete: sinon.stub(),
        clear: sinon.stub()
      },
      storagePath: '/test/storage',
      globalStoragePath: '/test/global',
      logPath: '/test/log',
      extensionMode: vscode.ExtensionMode.Test,
      asAbsolutePath: sinon.stub().returns('/test'),
      secrets: {
        get: sinon.stub(),
        store: sinon.stub(),
        delete: sinon.stub(),
        onDidChange: sinon.stub()
      }
    } as any;

    shellServiceStub = sinon.createStubInstance(ShellService);
    nvmServiceStub = sinon.createStubInstance(NvmService);
  });

  teardown(() => {
    sinon.restore();
  });

  test('Extension should activate successfully', async () => {
    // Mock the getCurrentNodeVersion to return a version
    shellServiceStub.execute.returns('v20.11.0');
    
    // Mock the getCurrentNodeVersion method
    const getCurrentVersionStub = sinon.stub(NvmService.prototype, 'getCurrentNodeVersion').returns('20.11.0');
    
    // Mock vscode.commands.registerCommand
    const registerCommandStub = sinon.stub(vscode.commands, 'registerCommand').returns({
      dispose: sinon.stub()
    });

    // Mock vscode.window.createStatusBarItem
    const statusBarItem = {
      text: '',
      tooltip: '',
      command: '',
      show: sinon.stub(),
      hide: sinon.stub(),
      dispose: sinon.stub()
    };
    const createStatusBarItemStub = sinon.stub(vscode.window, 'createStatusBarItem').returns(statusBarItem as any);

    // Call activate
    activate(mockContext);

    // Verify that the command was registered
    assert(registerCommandStub.calledOnce, 'Command should be registered');
    assert(createStatusBarItemStub.calledOnce, 'Status bar item should be created');
    assert(mockContext.subscriptions.length > 0, 'Should have subscriptions');

    // Cleanup
    getCurrentVersionStub.restore();
    registerCommandStub.restore();
    createStatusBarItemStub.restore();
  });

  test('Extension should deactivate without errors', () => {
    // Test that deactivate doesn't throw
    assert.doesNotThrow(() => {
      deactivate();
    });
  });

  test('Extension should be present in VS Code', () => {
    const extension = vscode.extensions.getExtension('subhendu-patra.node-version-switcher');
    assert(extension !== undefined, 'Extension should be found');
  });

  test('Extension should have correct package.json configuration', () => {
    const extension = vscode.extensions.getExtension('subhendu-patra.node-version-switcher');
    if (extension) {
      const packageJSON = extension.packageJSON;
      assert.strictEqual(packageJSON.name, 'node-version-switcher');
      assert.strictEqual(packageJSON.displayName, 'Node Version Switcher');
      assert(packageJSON.contributes.commands.length > 0);
      assert.strictEqual(packageJSON.contributes.commands[0].command, 'nodeVersionSwitcher.selectVersion');
    }
  });
});
