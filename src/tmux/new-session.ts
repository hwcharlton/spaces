import * as child_process from "node:child_process";

type EnvVar = {
  name: string;
  value: string;
};

type NewSessionOptions = {
  sessionName?: string;
  windowName?: string;
  startDirectory?: string;
  groupName?: string;
  environment?: EnvVar[];
  background?: boolean;
};

export function newSession(options?: NewSessionOptions) {
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
  child_process.spawnSync("tmux", args);
}
