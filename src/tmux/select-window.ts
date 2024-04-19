import child_process from "node:child_process";

type WindowChoice = "last" | "next" | "previous";

export type SelectWindowOptions = {
  targetWindow?: string;
  lastWindowIfSame?: boolean;
  relativeWindow?: WindowChoice;
};

const RELATIVE_WINDOW_ARGS: Record<WindowChoice, string> = {
  last: "-l",
  previous: "-p",
  next: "-n",
};

export function selectWindow(options?: SelectWindowOptions) {
  const args: string[] = ["select-window"];
  if (options?.relativeWindow) {
    args.push(RELATIVE_WINDOW_ARGS[options.relativeWindow]);
  }
  if (typeof options?.targetWindow === "string") {
    args.push("-t", options.targetWindow);
  }
  if (options?.lastWindowIfSame === true) {
    args.push("-T");
  }
  child_process.spawnSync("tmux", args);
}
