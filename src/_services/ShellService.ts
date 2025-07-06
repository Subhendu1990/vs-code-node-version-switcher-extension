import { IShellService } from '../_contracts/IShellService';
import * as child_process from 'child_process';

export class ShellService implements IShellService {
  execute(command: string): string {
    return child_process.execSync(command, { encoding: 'utf-8' }).trim();
  }
}
