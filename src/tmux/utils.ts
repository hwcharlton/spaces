import { spawnSync, SpawnSyncReturns } from "node:child_process";

export function runTmuxWithArgs(args: string[]): SpawnSyncReturns<Buffer> {
  const socketName = process.env.SPACES_TMUX_SOCKET_NAME;
  if (socketName !== undefined) {
    args.unshift("-L", socketName);
  }
  return spawnSync("tmux", args);
}

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
