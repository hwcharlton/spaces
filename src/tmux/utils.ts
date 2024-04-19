import { SpawnSyncReturns } from "node:child_process";

export function trimEndNewline(commandOutput: string): string {
  return commandOutput.replace(/\n$/, "");
}

export function extractCommandOutput(
  commandOuput: SpawnSyncReturns<Buffer>,
): string {
  if (commandOuput.stderr.length > 0) {
    throw new Error(commandOuput.stderr.toString());
  }
  return trimEndNewline(commandOuput.stdout.toString());
}
