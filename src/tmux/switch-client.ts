import { runTmuxWithArgs } from "./utils.js";

export type SwitchClientOptions = {
  targetClient?: string;
  targetSession?: string;
  keyTable?: string;
};

export function switchClient(options?: SwitchClientOptions) {
  const args: string[] = ["switch-client"];
  if (typeof options?.targetClient === "string") {
    args.push("-c", options.targetClient);
  }
  if (typeof options?.targetSession === "string") {
    args.push("-t", options.targetSession);
  }
  if (typeof options?.keyTable === "string") {
    args.push("-T", options.keyTable);
  }
  runTmuxWithArgs(args);
}
