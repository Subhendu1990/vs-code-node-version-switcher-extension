import * as vscode from 'vscode';
import { ICommand } from '../_contracts/ICommand';

export abstract class BaseCommand implements ICommand {
  constructor(public readonly commandId: string) {}

  abstract execute(...args: any[]): void | Promise<void>;

  register() {
    return vscode.commands.registerCommand(this.commandId, this.execute.bind(this));
  }
}
