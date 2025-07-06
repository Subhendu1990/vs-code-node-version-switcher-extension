export interface ICommand {
  commandId: string;
  register(): { dispose(): any };
}