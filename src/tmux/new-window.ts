import child_process from "node:child_process";
import { BeforeOrAfter, EnvVar } from "./types.js";

export type NewWindowOptions = {
  shellCommand?: string;
  startDirectory?: string;
  environment?: EnvVar[];
  format?: string;
  windowName?: string;
  targetWindow?: string;
  relativePosition?: BeforeOrAfter;
  background?: boolean;
  selectIfExists?: boolean;
  killTarget?: boolean;
  print?: boolean;
};

const POSITION_ARGS: Record<BeforeOrAfter, string> = {
  before: "-b",
  after: "-a",
};

export function newWindow(options?: NewWindowOptions) {
  const args: string[] = ["new-window"];
  if (typeof options?.startDirectory === "string") {
    args.push("-c", options.startDirectory);
  }
  if (Array.isArray(options?.environment)) {
    for (const envVar of options.environment) {
      args.push("-e", `${envVar.name}=${envVar.value}`);
    }
  }
  if (typeof options?.format === "string") {
    if (options.print !== true) {
      args.push("-P");
    }
    args.push("-F", options.format);
  }
  if (typeof options?.windowName === "string") {
    args.push("-n", options.windowName);
  }
  if (typeof options?.targetWindow === "string") {
    args.push("-t", options.targetWindow);
  }
  if (typeof options?.relativePosition === "string") {
    args.push(POSITION_ARGS[options.relativePosition]);
  }
  if (options?.background === true) {
    args.push("-d");
  }
  if (options?.selectIfExists === true) {
    args.push("-S");
  }
  if (options?.killTarget === true) {
    args.push("-k");
  }
  if (options?.print === true) {
    args.push("-P");
  }
  if (typeof options?.shellCommand === "string") {
    args.push(options.shellCommand);
  }
  const commandResult = child_process.spawnSync("tmux", args);
  return commandResult.stdout.toString();
}
