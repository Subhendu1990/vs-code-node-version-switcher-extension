import { IVersionManagerService } from '../_contracts/IVersionManagerService';
import { IShellService } from '../_contracts/IShellService';
import * as os from 'os';
import { SHELL_COMMANDS } from '../_constants/shell_commands';

export class NvmService implements IVersionManagerService {
  constructor(private readonly shell: IShellService) {}

  isVersionManagerInstalled(): boolean {
    this.shell.execute(SHELL_COMMANDS.NVM_VERSION)
    return true; 
  }

  installVersionManager(): void {
    const installScript = os.platform() === 'win32'
      ? 'https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.exe'
      : 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh';
    
    const installCommand = os.platform() === 'win32'
      ? `powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri ${installScript} -OutFile nvm-setup.exe; Start-Process .\\nvm-setup.exe -Wait; Remove-Item nvm-setup.exe"`
      : `curl -o- ${installScript} | bash`;
    
    this.shell.execute(installCommand);
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
    this.shell.execute(`${SHELL_COMMANDS.NVM_USE_NODE} ${version}`);
  }

  installNodeVersion(version: string): void {
    
    this.shell.execute(`${SHELL_COMMANDS.NVM_INSTALL_NODE} ${version}`);
  }
}
