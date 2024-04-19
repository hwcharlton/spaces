import child_process from "node:child_process";
import { extractCommandOutput } from "./utils.js";

export type ListSessionOptions = {
  format?: string;
  filter?: string;
};

export function listSessions(options?: ListSessionOptions): string {
  const args: string[] = ["list-sessions"];

  if (typeof options?.format === "string") {
    args.push("-F", options.format);
  }
  if (typeof options?.filter === "string") {
    args.push("-f", options.filter);
  }

  return extractCommandOutput(child_process.spawnSync("tmux", args));
}
