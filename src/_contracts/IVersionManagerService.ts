export interface IVersionManagerService {
  isVersionManagerInstalled(): boolean;
  installVersionManager(): void;
  getCurrentNodeVersion(): string;
  listNodeVersions(): string[]; // List all installed versions
  listOtherNodeVersions(): string[]; // List versions excluding the current one
  useNodeVersion(version: string): void;
  installNodeVersion(version: string): void;
}