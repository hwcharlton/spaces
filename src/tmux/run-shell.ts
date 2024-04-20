import child_process from "node:child_process";

export type RunShellOptions = {
  shellCommand?: string;
  targetPane?: string;
  /** Delay in seconds */
  delay?: number;
  tmuxCommand?: boolean;
  background?: boolean;
};

export function runShell(options?: RunShellOptions) {
  const args: string[] = ["run-shell"];
  if (typeof options?.targetPane === "string") {
    args.push("-t", options.targetPane);
  }
  if (typeof options?.delay === "number") {
    args.push("-d", options.delay.toFixed(0));
  }
  if (options?.tmuxCommand === true) {
    args.push("-C");
  }
  if (options?.background === true) {
    args.push("-b");
  }
  if (typeof options?.shellCommand === "string") {
    args.push(options.shellCommand);
  }
  child_process.spawnSync("tmux", args);
}
