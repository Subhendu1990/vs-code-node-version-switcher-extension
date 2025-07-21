import { strict as assert } from 'assert';
import { SHELL_COMMANDS } from '../../../_constants/shell_commands';
import { COMMAND_IDS } from '../../../_constants/commandIds';

suite('Constants Test Suite', () => {
  test('SHELL_COMMANDS should have correct values', () => {
    assert.strictEqual(SHELL_COMMANDS.NODE_VERSION, 'node -v');
    assert.strictEqual(SHELL_COMMANDS.NVM_VERSION, 'nvm --version');
    assert.strictEqual(SHELL_COMMANDS.NVM_LIST_NODE, 'nvm list');
    assert.strictEqual(SHELL_COMMANDS.NVM_USE_NODE, 'nvm use');
    assert.strictEqual(SHELL_COMMANDS.NVM_INSTALL_NODE, 'nvm install');
  });

  test('COMMAND_IDS should have correct values', () => {
    assert.strictEqual(COMMAND_IDS.SELECT_NODE_VERSION, 'extension.selectNodeVersion');
  });
});
