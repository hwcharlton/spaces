import child_process from "node:child_process";

export type DisplayMessageOptions = {
  toStdout?: boolean;
  delay?: number;
  ignoreKeypress?: boolean;
  message?: string;
  targetPane?: string;
  verbose?: boolean;
  listAll?: boolean;
};

export function displayMessage(options?: DisplayMessageOptions): string {
  const args = ["display-message"];
  if (options?.toStdout === true) {
    args.push("-p");
  }
  if (typeof options?.delay === "number") {
    args.push("-d", options.delay.toFixed(0));
  }
  if (options?.ignoreKeypress === true) {
    args.push("-N");
  }
  if (typeof options?.targetPane === "string") {
    args.push("-t", options.targetPane);
  }
  if (options?.verbose === true) {
    args.push("-v");
  }
  if (options?.listAll === true) {
    args.push("-a");
  }
  if (typeof options?.message === "string") {
    args.push(options.message);
  }

  const commandResult = child_process.spawnSync("tmux", args);
  return commandResult.stdout.toString();
}
