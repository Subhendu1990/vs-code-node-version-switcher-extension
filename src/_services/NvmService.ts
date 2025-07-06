import { IVersionManagerService } from '../_contracts/IVersionManagerService';
import { IShellService } from '../_contracts/IShellService';
import * as os from 'os';

export class NvmService implements IVersionManagerService {
  constructor(private readonly shell: IShellService) {}

  isVersionManagerInstalled(): boolean {
    const command = os.platform() === 'win32' ? 'nvm --version' : 'bash -ic nvm --version';
    this.shell.execute(command);
    return true; 
  }

  installVersionManager(): void {
    const installScript = os.platform() === 'win32'
      ? 'https://raw.githubusercontent.com/coreybutler/nvm-windows/master/install.ps1'
      : 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh';
    const installCommand = os.platform() === 'win32'
      ? `powershell -Command "Invoke-WebRequest -Uri ${installScript} -OutFile nvm-install.ps1; .\\nvm-install.ps1"`
      : `curl -o- ${installScript} | bash`;
    this.shell.execute(installCommand);
  }

  getCurrentNodeVersion(): string {
    try {
      const command = os.platform() === 'win32' ? 'node -v' : 'bash -ic "node -v"';
      return this.shell.execute(command).replace('v', '').trim();
    } catch {
      return 'Not Available';
    }
  }

  listNodeVersions(): string[] {
    try {
      let raw: string;

      if (os.platform() === 'win32') {
        // Windows (nvm-windows)
        raw = this.shell.execute('nvm list');
      } else {
        // macOS / Linux
        raw = this.shell.execute('bash -ic "nvm ls"');
      }
      const versions = raw.match(/\d+\.\d+\.\d+/g) ?? [];
      return versions;
    } catch (error) {
      console.error("Error listing versions", error);
      return [];
    }
  }
  listOtherNodeVersions(): string[] {
    const currentVersion = this.getCurrentNodeVersion();
    return this.listNodeVersions().filter(version => version !== currentVersion);
  }

  useNodeVersion(version: string): void {
    if (os.platform() === 'win32') {
      // Windows (nvm-windows)
      this.shell.execute(`nvm use ${version}`);
    } else {
      // macOS / Linux
      this.shell.execute(`bash -ic "nvm use ${version}"`);
    }
  }

  installNodeVersion(version: string): void {
    if (os.platform() === 'win32') {
      // Windows (nvm-windows)
      this.shell.execute(`nvm install ${version}`);
    } else {
      // macOS / Linux
      this.shell.execute(`bash -ic "nvm install ${version}"`);
    }
  }
}
