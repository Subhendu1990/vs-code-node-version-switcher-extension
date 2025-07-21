import { strict as assert } from 'assert';
import * as sinon from 'sinon';
import { NvmService } from '../../../_services/NvmService';
import { IShellService } from '../../../_contracts/IShellService';
import { SHELL_COMMANDS } from '../../../_constants/shell_commands';

suite('NvmService Test Suite', () => {
  let nvmService: NvmService;
  let mockShellService: sinon.SinonStubbedInstance<IShellService>;

  setup(() => {
    mockShellService = {
      platform: 'linux', // Default platform
      execute: sinon.stub()
    };
    nvmService = new NvmService(mockShellService);
  });

  teardown(() => {
    sinon.restore();
  });

  suite('isVersionManagerInstalled', () => {
    test('should return true when nvm is installed', () => {
      mockShellService.execute.withArgs(SHELL_COMMANDS.NVM_VERSION).returns('0.39.7');

      const result = nvmService.isVersionManagerInstalled();

      assert.strictEqual(result, true);
      assert(mockShellService.execute.calledWith(SHELL_COMMANDS.NVM_VERSION));
    });

    test('should return false even when nvm command fails', () => {
      mockShellService.execute.withArgs(SHELL_COMMANDS.NVM_VERSION).throws(new Error('Command not found'));

      const result = nvmService.isVersionManagerInstalled();

      // Note: Current implementation always returns true, this might need to be changed
      assert.strictEqual(result, false);
    });
  });

  suite('installVersionManager', () => {
    test('should install nvm on Windows', () => {
      mockShellService.platform = 'win32'; // Set platform on mock service
      mockShellService.execute.returns('');

      nvmService.installVersionManager();

      assert(mockShellService.execute.calledOnce);
      /* const callArgs = mockShellService.execute.getCall(0).args[0];
      assert(callArgs.includes('nvm-windows'));
      assert(callArgs.includes('powershell')); */
    });

    test('should install nvm on macOS/Linux', () => {
      mockShellService.platform = 'darwin'; // Set platform on mock service
      mockShellService.execute.returns('');

      nvmService.installVersionManager();

      assert(mockShellService.execute.calledOnce);
      /* const callArgs = mockShellService.execute.getCall(0).args[0];
      assert(callArgs.includes('curl'));
      assert(!callArgs.includes('install.sh')); */
    });
  });

  suite('getCurrentNodeVersion', () => {
    test('should return current Node version without "v" prefix', () => {
      mockShellService.execute.withArgs(SHELL_COMMANDS.NODE_VERSION).returns('v20.11.0');

      const result = nvmService.getCurrentNodeVersion();

      assert.strictEqual(result, '20.11.0');
    });

    test('should return trimmed version', () => {
      mockShellService.execute.withArgs(SHELL_COMMANDS.NODE_VERSION).returns('  v18.19.0  \n');

      const result = nvmService.getCurrentNodeVersion();

      assert.strictEqual(result, '18.19.0');
    });

    test('should return "Not Available" when command fails', () => {
      mockShellService.execute.withArgs(SHELL_COMMANDS.NODE_VERSION).throws(new Error('Command failed'));

      const result = nvmService.getCurrentNodeVersion();

      assert.strictEqual(result, 'Not Available');
    });

    test('should handle version without "v" prefix', () => {
      mockShellService.execute.withArgs(SHELL_COMMANDS.NODE_VERSION).returns('20.11.0');

      const result = nvmService.getCurrentNodeVersion();

      assert.strictEqual(result, '20.11.0');
    });
  });

  suite('listNodeVersions', () => {
    test('should return list of installed Node versions', () => {
      const nvmOutput = `
        v18.19.0
        v20.11.0
        v21.5.0
      `;
      mockShellService.execute.withArgs(SHELL_COMMANDS.NVM_LIST_NODE).returns(nvmOutput);

      const result = nvmService.listNodeVersions();
      console.log("NNNNN", result);

      assert.deepStrictEqual(result, ['18.19.0', '20.11.0', '21.5.0']);
    });

    test('should handle complex nvm list output', () => {
      const nvmOutput = `
        v16.20.0
        v18.19.0
        v20.11.0   (currently using 64-bit executable)
        v21.5.0
      `;
      mockShellService.execute.withArgs(SHELL_COMMANDS.NVM_LIST_NODE).returns(nvmOutput);

      const result = nvmService.listNodeVersions();

      assert.deepStrictEqual(result, ['16.20.0', '18.19.0', '20.11.0', '21.5.0']);
    });

    test('should return empty array when no versions found', () => {
      mockShellService.execute.withArgs(SHELL_COMMANDS.NVM_LIST_NODE).returns('No versions installed');

      const result = nvmService.listNodeVersions();

      assert.deepStrictEqual(result, []);
    });

    test('should return empty array when command fails', () => {
      mockShellService.execute.withArgs(SHELL_COMMANDS.NVM_LIST_NODE).throws(new Error('Command failed'));

      const result = nvmService.listNodeVersions();

      assert.deepStrictEqual(result, []);
    });
  });

  suite('listOtherNodeVersions', () => {
    test('should return versions excluding current version', () => {
      mockShellService.execute.withArgs(SHELL_COMMANDS.NODE_VERSION).returns('v20.11.0');
      mockShellService.execute.withArgs(SHELL_COMMANDS.NVM_LIST_NODE).returns(`
        v18.19.0
        v20.11.0
        v21.5.0
      `);

      const result = nvmService.listOtherNodeVersions();

      assert.deepStrictEqual(result, ['18.19.0', '21.5.0']);
    });

    test('should handle when current version is not in list', () => {
      mockShellService.execute.withArgs(SHELL_COMMANDS.NODE_VERSION).returns('v22.0.0');
      mockShellService.execute.withArgs(SHELL_COMMANDS.NVM_LIST_NODE).returns(`
        v18.19.0
        v20.11.0
        v21.5.0
      `);

      const result = nvmService.listOtherNodeVersions();

      assert.deepStrictEqual(result, ['18.19.0', '20.11.0', '21.5.0']);
    });

    test('should return empty array when only current version installed', () => {
      mockShellService.execute.withArgs(SHELL_COMMANDS.NODE_VERSION).returns('v20.11.0');
      mockShellService.execute.withArgs(SHELL_COMMANDS.NVM_LIST_NODE).returns('v20.11.0');

      const result = nvmService.listOtherNodeVersions();

      assert.deepStrictEqual(result, []);
    });
  });

  suite('useNodeVersion', () => {
    test('should execute nvm use command with version', () => {
      const version = '20.11.0';
      mockShellService.execute.returns('Now using node v20.11.0');

      nvmService.useNodeVersion(version);

      assert(mockShellService.execute.calledWith(`${SHELL_COMMANDS.NVM_USE_NODE} ${version}`));
    });

    test('should handle command execution', () => {
      const version = '18.19.0';
      mockShellService.execute.returns('Now using node v18.19.0');

      assert.doesNotThrow(() => {
        nvmService.useNodeVersion(version);
      });
    });
  });

  suite('installNodeVersion', () => {
    test('should execute nvm install command with version', () => {
      const version = '21.5.0';
      mockShellService.execute.returns('Installing node v21.5.0...');

      nvmService.installNodeVersion(version);

      assert(mockShellService.execute.calledWith(`${SHELL_COMMANDS.NVM_INSTALL_NODE} ${version}`));
    });

    test('should handle major version number', () => {
      const version = '20';
      mockShellService.execute.returns('Installing node v20.11.0...');

      nvmService.installNodeVersion(version);

      assert(mockShellService.execute.calledWith(`${SHELL_COMMANDS.NVM_INSTALL_NODE} ${version}`));
    });

    test('should handle command execution', () => {
      const version = '19.9.0';
      mockShellService.execute.returns('Installing...');

      assert.doesNotThrow(() => {
        nvmService.installNodeVersion(version);
      });
    });
  });

  suite('Error Handling', () => {
    test('should handle shell service errors gracefully', () => {
      mockShellService.execute.throws(new Error('Shell command failed'));

      // These methods should throw when shell service fails
      assert.throws(() => nvmService.installVersionManager(), /Shell command failed/);
      assert.throws(() => nvmService.useNodeVersion('20.11.0'), /Shell command failed/);
      assert.throws(() => nvmService.installNodeVersion('20.11.0'), /Shell command failed/);
    });

    test('should handle errors in methods that return values', () => {
      mockShellService.execute.throws(new Error('Shell command failed'));

      // These methods should handle errors gracefully and return safe values
      assert.doesNotThrow(() => nvmService.getCurrentNodeVersion());
      assert.doesNotThrow(() => nvmService.listNodeVersions());
      assert.doesNotThrow(() => nvmService.listOtherNodeVersions());
      
      // Verify they return appropriate fallback values
      assert.strictEqual(nvmService.getCurrentNodeVersion(), 'Not Available');
      assert.deepStrictEqual(nvmService.listNodeVersions(), []);
      assert.deepStrictEqual(nvmService.listOtherNodeVersions(), []);
    });
  });
});
