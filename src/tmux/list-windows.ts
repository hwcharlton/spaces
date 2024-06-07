import { runTmuxWithArgs } from "./utils.js";
import { extractCommandOutput } from "./utils.js";

export type ListWindowsOptions = {
  targetSession?: string;
  listAll?: boolean;
  format?: string;
  filter?: string;
};

export function listWindows(options?: ListWindowsOptions): string {
  const args: string[] = ["list-windows"];
  if (options?.listAll === true) {
    args.push("-a");
  }
  if (typeof options?.targetSession === "string") {
    args.push("-t", options.targetSession);
  }
  if (typeof options?.filter === "string") {
    args.push("-f", options.filter);
  }
  if (typeof options?.format === "string") {
    args.push("-F", options.format);
  }

  return extractCommandOutput(runTmuxWithArgs(args));
}
