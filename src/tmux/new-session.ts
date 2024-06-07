import { runTmuxWithArgs } from "./utils.js";
import { EnvVar } from "./types.js";
import { extractCommandOutput } from "./utils.js";

type NewSessionOptions = {
  sessionName?: string;
  windowName?: string;
  startDirectory?: string;
  groupName?: string;
  environment?: EnvVar[];
  background?: boolean;
  shellCommand?: string;
  format?: string;
  output?: boolean;
};

export function newSession(options?: NewSessionOptions): string {
  const args: string[] = ["new-session"];
  if (options?.background) {
    args.push("-d");
  }
  if (typeof options?.sessionName === "string") {
    args.push("-s", options.sessionName);
  }
  if (typeof options?.windowName === "string") {
    args.push("-n", options.windowName);
  }
  if (typeof options?.startDirectory === "string") {
    args.push("-c", options.startDirectory);
  }
  if (typeof options?.groupName === "string") {
    args.push("-t", options.groupName);
  }
  if (Array.isArray(options?.environment)) {
    for (const envVar of options.environment) {
      args.push("-e", `${envVar.name}=${envVar.value}`);
    }
  }
  if (options?.output === true) {
    args.push("-P");
  }
  if (typeof options?.format === "string") {
    if (options.output !== true) {
      args.push("-P");
    }
    args.push("-F", options.format);
  }
  if (typeof options?.shellCommand === "string") {
    args.push(options.shellCommand);
  }
  return extractCommandOutput(runTmuxWithArgs(args));
}
