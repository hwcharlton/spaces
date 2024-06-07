import { runTmuxWithArgs } from "./utils.js";

export type KillSessionOptions = {
  killOtherSessions?: boolean;
  clearAlerts?: boolean;
  target?: string;
};

export function killSession(options?: KillSessionOptions) {
  const args: string[] = ["kill-session"];
  if (typeof options?.target === "string") {
    args.push("-t", options.target);
  }
  if (options?.clearAlerts === true) {
    args.push("-C");
  }
  if (options?.killOtherSessions === true) {
    args.push("-a");
  }
  runTmuxWithArgs(args);
}
