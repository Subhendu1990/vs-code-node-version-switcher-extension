import { IShellService } from '../_contracts/IShellService';
import * as child_process from 'child_process';
import * as os from 'os';

export class ShellService implements IShellService {
  platform: string;
  constructor() {
    this.platform = os.platform(); // 'win32', 'darwin', or 'linux'
  }
  execute(command: string): string {
    let opt: any = { encoding: 'utf-8' };
    if (this.platform === 'win32') {
      opt = { ...opt, shell: 'powershell.exe' }; // default is cmd.exe, but PowerShell is more versatile
    } else if (this.platform === 'darwin') {
      // macOS specific configuration
      opt = { 
        ...opt, 
        shell: '/bin/zsh', // Default shell on macOS since Catalina
        env: { ...process.env } // Include environment variables
      };
    } else if (this.platform === 'linux') {
      opt = { ...opt, shell: '/bin/bash' };
    }
    return child_process.execSync(command, opt).toString().trim();
  }
}
