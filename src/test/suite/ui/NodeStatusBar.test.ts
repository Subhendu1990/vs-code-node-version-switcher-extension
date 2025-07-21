import { strict as assert } from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { NodeStatusBar } from '../../../_ui/NodeStatusBar';

suite('NodeStatusBar Test Suite', () => {
  let statusBar: NodeStatusBar;
  let mockStatusBarItem: sinon.SinonStubbedInstance<vscode.StatusBarItem>;
  let createStatusBarItemStub: sinon.SinonStub;

  setup(() => {
    mockStatusBarItem = {
      text: '',
      tooltip: '',
      command: '',
      show: sinon.stub(),
      hide: sinon.stub(),
      dispose: sinon.stub(),
      alignment: vscode.StatusBarAlignment.Right,
      priority: 100,
      backgroundColor: undefined,
      color: undefined,
      id: 'test-id',
      name: 'test-name',
      accessibilityInformation: undefined
    } as any;

    createStatusBarItemStub = sinon.stub(vscode.window, 'createStatusBarItem');
    createStatusBarItemStub.returns(mockStatusBarItem);
  });

  teardown(() => {
    sinon.restore();
  });

  suite('Constructor', () => {
    test('should create status bar item with correct parameters', () => {
      const commandId = 'test.command';
      const initialVersion = '20.11.0';

      statusBar = new NodeStatusBar(commandId, initialVersion);

      assert(createStatusBarItemStub.calledOnce);
      assert(createStatusBarItemStub.calledWith(vscode.StatusBarAlignment.Right, 100));
      assert.strictEqual(mockStatusBarItem.command, commandId);
      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 20.11.0');
      assert(mockStatusBarItem.show.calledOnce);
    });

    test('should handle "Not Available" version', () => {
      const commandId = 'test.command';
      const initialVersion = 'Not Available';

      statusBar = new NodeStatusBar(commandId, initialVersion);

      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: Not Available');
    });

    test('should handle empty version string', () => {
      const commandId = 'test.command';
      const initialVersion = '';

      statusBar = new NodeStatusBar(commandId, initialVersion);

      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: ');
    });

    test('should show status bar item after creation', () => {
      const commandId = 'test.command';
      const initialVersion = '18.19.0';

      statusBar = new NodeStatusBar(commandId, initialVersion);

      assert(mockStatusBarItem.show.calledOnce);
    });
  });

  suite('Update Method', () => {
    setup(() => {
      statusBar = new NodeStatusBar('test.command', '20.11.0');
      // Reset the call count after constructor
      mockStatusBarItem.show.resetHistory();
    });

    test('should update text with new version', () => {
      const newVersion = '21.5.0';

      statusBar.update(newVersion);

      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 21.5.0');
    });

    test('should update text with version number only', () => {
      const newVersion = '18.19.0';

      statusBar.update(newVersion);

      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 18.19.0');
    });

    test('should handle "Not Available" update', () => {
      const newVersion = 'Not Available';

      statusBar.update(newVersion);

      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: Not Available');
    });

    test('should handle empty string update', () => {
      const newVersion = '';

      statusBar.update(newVersion);

      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: ');
    });

    test('should handle multiple updates', () => {
      statusBar.update('18.19.0');
      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 18.19.0');

      statusBar.update('20.11.0');
      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 20.11.0');

      statusBar.update('21.5.0');
      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 21.5.0');
    });

    test('should preserve icon in text', () => {
      const newVersion = '19.9.0';

      statusBar.update(newVersion);

      assert(mockStatusBarItem.text.includes('$(versions)'));
      assert(mockStatusBarItem.text.includes('Node:'));
      assert(mockStatusBarItem.text.includes('19.9.0'));
    });
  });

  suite('Dispose Method', () => {
    setup(() => {
      statusBar = new NodeStatusBar('test.command', '20.11.0');
    });

    test('should dispose underlying status bar item', () => {
      statusBar.dispose();

      assert(mockStatusBarItem.dispose.calledOnce);
    });

    test('should handle multiple dispose calls', () => {
      statusBar.dispose();
      statusBar.dispose();

      assert(mockStatusBarItem.dispose.calledTwice);
    });
  });

  suite('Integration Tests', () => {
    test('should work with real command ID from extension', () => {
      const commandId = 'extension.selectNodeVersion';
      const initialVersion = '20.11.0';

      statusBar = new NodeStatusBar(commandId, initialVersion);

      assert.strictEqual(mockStatusBarItem.command, commandId);
      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 20.11.0');
    });

    test('should maintain state across updates', () => {
      const commandId = 'extension.selectNodeVersion';
      const initialVersion = '20.11.0';

      statusBar = new NodeStatusBar(commandId, initialVersion);
      
      // Verify initial state
      assert.strictEqual(mockStatusBarItem.command, commandId);
      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 20.11.0');

      // Update version
      statusBar.update('18.19.0');
      
      // Verify command is still set after update
      assert.strictEqual(mockStatusBarItem.command, commandId);
      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 18.19.0');
    });

    test('should handle version changes typical in extension usage', () => {
      const commandId = 'extension.selectNodeVersion';
      statusBar = new NodeStatusBar(commandId, 'Not Available');

      // Simulate installing Node
      statusBar.update('20.11.0');
      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 20.11.0');

      // Simulate switching versions
      statusBar.update('18.19.0');
      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 18.19.0');

      // Simulate switching back
      statusBar.update('20.11.0');
      assert.strictEqual(mockStatusBarItem.text, '$(versions) Node: 20.11.0');
    });
  });

  suite('Error Handling', () => {
    test('should handle status bar item creation failure gracefully', () => {
      createStatusBarItemStub.throws(new Error('Failed to create status bar item'));

      assert.throws(() => {
        statusBar = new NodeStatusBar('test.command', '20.11.0');
      });
    });

    test('should handle show method failure', () => {
      mockStatusBarItem.show.throws(new Error('Show failed'));

      assert.throws(() => {
        statusBar = new NodeStatusBar('test.command', '20.11.0');
      });
    });
  });
});
