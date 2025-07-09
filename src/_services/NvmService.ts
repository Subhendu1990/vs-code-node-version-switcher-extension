import { IVersionManagerService } from '../_contracts/IVersionManagerService';
import { IShellService } from '../_contracts/IShellService';
import * as os from 'os';
import { SHELL_COMMANDS } from '../_constants/shell_commands';

export class NvmService implements IVersionManagerService {
  constructor(private readonly shell: IShellService) {}

  isVersionManagerInstalled(): boolean {
    try {
      this.shell.execute(SHELL_COMMANDS.NVM_VERSION)
      return true; 
    } catch (error) {
      console.error("Error checking nvm installation", error);
      return false; // Return false if the command fails
    }
  }

  installVersionManager(): void {
    const installScript = os.platform() === 'win32'
      ? 'https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.exe'
      : 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh';
    
    const installCommand = os.platform() === 'win32'
      ? `powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri ${installScript} -OutFile nvm-setup.exe; Start-Process .\\nvm-setup.exe -Wait; Remove-Item nvm-setup.exe"`
      : `curl -o- ${installScript} | bash`;
    try {
      this.shell.execute(installCommand);
    } catch (error) {
      console.error("Error installing nvm", error);
      throw new Error(`Failed to install nvm}`);
    }
  }

  getCurrentNodeVersion(): string {
    try {
      return this.shell.execute(SHELL_COMMANDS.NODE_VERSION).replace('v', '').trim();
    } catch {
      return 'Not Available';
    }
  }

  listNodeVersions(): string[] {
    try {
      let raw = this.shell.execute(SHELL_COMMANDS.NVM_LIST_NODE);
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
    if (!this.isVersionManagerInstalled()) {
      throw new Error('nvm is not installed. Please install it first.');
    }
    if (!this.listNodeVersions().includes(version)) {
      throw new Error(`Node version ${version} is not installed.`);
    }
    if (version.startsWith('v')) {
      version = version.slice(1); // Remove 'v' prefix if present
    }
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      throw new Error(`Invalid Node version format: ${version}. Expected format is x.x.x`);
    }
    try {
      this.shell.execute(`${SHELL_COMMANDS.NVM_USE_NODE} ${version}`);
    } catch (error) {
      console.error(`Error using Node version ${version}`, error);
      throw new Error(`Failed to switch to Node version ${version}.`);
    }
  }

  installNodeVersion(version: string): void {
    if (!this.isVersionManagerInstalled()) {
      throw new Error('nvm is not installed. Please install it first.');
    }
    if (version.startsWith('v')) {
      version = version.slice(1); // Remove 'v' prefix if present
    }
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
      throw new Error(`Invalid Node version format: ${version}. Expected format is x.x.x`);
    }
    if (this.listNodeVersions().includes(version)) {
      throw new Error(`Node version ${version} is already installed.`);
    }
    try {
      this.shell.execute(`${SHELL_COMMANDS.NVM_INSTALL_NODE} ${version}`);
    } catch (error) {
      console.error(`Error installing Node version ${version}`, error);
      throw new Error(`Failed to install Node version ${version}.`);
    }
  }
}
