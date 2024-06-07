import { runTmuxWithArgs } from "./utils.js";
import { extractCommandOutput } from "./utils.js";

export type ListPanesOptions = {
  listAll?: boolean;
  targetIsSession?: boolean;
  format?: string;
  filter?: string;
  target?: string;
};

export function listPanes(options?: ListPanesOptions): string {
  const args: string[] = ["list-panes"];
  if (typeof options?.target === "string") {
    args.push("-t", options.target);
  }
  if (typeof options?.format === "string") {
    args.push("-F", options.format);
  }
  if (typeof options?.filter === "string") {
    args.push("-f", options.filter);
  }
  if (options?.listAll === true) {
    args.push("-a");
  }
  if (options?.targetIsSession === true) {
    args.push("-s");
  }
  return extractCommandOutput(runTmuxWithArgs(args));
}
