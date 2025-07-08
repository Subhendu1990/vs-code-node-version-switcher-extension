export interface IShellService {
  platform: string; // 'win32', 'darwin', or 'linux'
  execute(command: string): string;
}