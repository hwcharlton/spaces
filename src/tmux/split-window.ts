import child_process from "node:child_process";
import { EnvVar, Orientation } from "./types.js";

export type SplitWindowOptions = {
  startDirectory?: string;
  environment?: EnvVar[];
  size?: string;
  targetPane?: string;
  shellCommand?: string;
  orientation?: Orientation;
  full?: boolean;
  zoom?: boolean;
  format?: string;
  leftOrAbove?: boolean;
};

export function splitWindow(options?: SplitWindowOptions) {
  const args: string[] = ["split-window"];
  if (typeof options?.startDirectory === "string") {
    args.push("-c", options.startDirectory);
  }
  if (Array.isArray(options?.environment)) {
    for (const envVar of options.environment) {
      args.push("-e", `${envVar.name}=${envVar.value}`);
    }
  }
  if (typeof options?.size === "string") {
    args.push("-l", options.size);
  }
  if (typeof options?.targetPane === "string") {
    args.push("-t", options.targetPane);
  }
  if (typeof options?.orientation === "string") {
    if (options.orientation === "vertical") {
      args.push("-v");
    } else {
      args.push("-h");
    }
  }
  if (options?.full === true) {
    args.push("-f");
  }
  if (options?.zoom === true) {
    args.push("-Z");
  }
  if (typeof options?.format === "string") {
    args.push("-P", "-F", options.format);
  }
  if (options?.leftOrAbove === true) {
    args.push("-b");
  }
  if (typeof options?.shellCommand === "string") {
    args.push(options.shellCommand);
  }
  const result = child_process.spawnSync("tmux", args);
  if (result.stderr.byteLength > 0) {
    throw new Error(result.stderr.toString());
  }
  return result.stdout.toString();
}
