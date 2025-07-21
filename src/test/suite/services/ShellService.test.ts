import { strict as assert } from 'assert';
import * as sinon from 'sinon';
import proxyquire from 'proxyquire';

suite('ShellService Test Suite', () => {
  let shellService: any;
  let execSyncStub: sinon.SinonStub;
  let platformStub: sinon.SinonStub;
  let ShellService: any;

  setup(() => {
    execSyncStub = sinon.stub();
    platformStub = sinon.stub();

    ShellService = proxyquire('../../../_services/ShellService', {
      'child_process': {
        execSync: execSyncStub
      },
      'os': {
        platform: platformStub
      }
    }).ShellService;
  });

  teardown(() => {
    sinon.restore();
  });

  suite('Windows Platform Tests', () => {
    setup(() => {
      platformStub.returns('win32');
      shellService = new ShellService();
    });

    test('should execute command with PowerShell on Windows', () => {
      const testCommand = 'node -v';
      const expectedOutput = 'v20.11.0';
      
      execSyncStub.returns(Buffer.from(expectedOutput + '\n'));

      const result = shellService.execute(testCommand);

      assert.strictEqual(result, expectedOutput);
      assert(execSyncStub.calledOnce);
      assert(execSyncStub.calledWith(testCommand, {
        encoding: 'utf-8',
        shell: 'powershell.exe'
      }));
    });

    test('should handle command execution errors on Windows', () => {
      const testCommand = 'invalid-command';
      const error = new Error('Command not found');
      
      execSyncStub.throws(error);

      assert.throws(() => {
        shellService.execute(testCommand);
      }, error);
    });
  });

  suite('macOS Platform Tests', () => {
    setup(() => {
      platformStub.returns('darwin');
      shellService = new ShellService();
    });

    test('should execute command with zsh on macOS', () => {
      const testCommand = 'node -v';
      const expectedOutput = 'v20.11.0';
      
      execSyncStub.returns(Buffer.from(expectedOutput + '\n'));

      const result = shellService.execute(testCommand);

      assert.strictEqual(result, expectedOutput);
      assert(execSyncStub.calledOnce);
      assert(execSyncStub.calledWith(testCommand, {
        encoding: 'utf-8',
        shell: '/bin/zsh',
        env: process.env
      }));
    });
  });

  suite('Linux Platform Tests', () => {
    setup(() => {
      platformStub.returns('linux');
      shellService = new ShellService();
    });

    test('should execute command with bash on Linux', () => {
      const testCommand = 'node -v';
      const expectedOutput = 'v20.11.0';
      
      execSyncStub.returns(Buffer.from(expectedOutput + '\n'));

      const result = shellService.execute(testCommand);

      assert.strictEqual(result, expectedOutput);
      assert(execSyncStub.calledOnce);
      assert(execSyncStub.calledWith(testCommand, {
        encoding: 'utf-8',
        shell: '/bin/bash'
      }));
    });
  });

  suite('General Tests', () => {
    test('should initialize with correct platform', () => {
      platformStub.returns('win32');
      const service = new ShellService();
      assert.strictEqual(service.platform, 'win32');

      platformStub.returns('darwin');
      const service2 = new ShellService();
      assert.strictEqual(service2.platform, 'darwin');

      platformStub.returns('linux');
      const service3 = new ShellService();
      assert.strictEqual(service3.platform, 'linux');
    });

    test('should trim whitespace from command output', () => {
      const testCommand = 'node -v';
      const outputWithWhitespace = '  v20.11.0  \n\t';
      
      execSyncStub.returns(Buffer.from(outputWithWhitespace));

      const result = shellService.execute(testCommand);

      assert.strictEqual(result, 'v20.11.0');
    });
  });
});
