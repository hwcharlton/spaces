import { runTmuxWithArgs } from "./utils.js";
import { extractCommandOutput } from "./utils.js";

export type DisplayMessageOptions = {
  toStdout?: boolean;
  delay?: number;
  ignoreKeypress?: boolean;
  message?: string;
  targetPane?: string;
  verbose?: boolean;
  listAll?: boolean;
};

/**
 * Set option 'message' to a string and 'toStdout' to true to retrieve the
 * result of a tmux formatted string.
 */
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

  return extractCommandOutput(runTmuxWithArgs(args));
}
