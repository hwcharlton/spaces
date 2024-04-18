import * as child_process from "node:child_process";

type EnvVar = {
  name: string;
  value: string;
};

type SessionInfo = {
  sessionName: string;
};

type NewSessionOptions = {
  sessionName?: string;
  windowName?: string;
  startDirectory?: string;
  groupName?: string;
  environment?: EnvVar[];
  background?: boolean;
};

export function listSessions(): SessionInfo[] {
  const commandResult = child_process.spawnSync("tmux", [
    "list-sessions",
    "-F",
    "#{session_name}",
  ]);
  const sessionNames = commandResult.stdout
    .toString()
    .split("\n")
    .filter((sessionName) => sessionName.length > 0);
  const res: SessionInfo[] = [];
  for (const sessionName of sessionNames) {
    res.push({
      sessionName,
    });
  }
  return res;
}

export function newSession(options?: NewSessionOptions) {
  const args: string[] = ["new-session"];
  if (options?.background) {
    args.push("-d");
  }
  if (typeof options?.sessionName === "string") {
    args.push(...["-s", options.sessionName]);
  }
  if (typeof options?.windowName === "string") {
    args.push(...["-n", options.windowName]);
  }
  if (typeof options?.startDirectory === "string") {
    args.push(...["-c", options.startDirectory]);
  }
  if (typeof options?.groupName === "string") {
    args.push(...["-t", options.groupName]);
  }
  if (Array.isArray(options?.environment)) {
    for (const envVar of options.environment) {
      args.push(...["-e", `${envVar.name}=${envVar.value}`]);
    }
  }
  const processResult = child_process.spawnSync("tmux", args);
  console.log(processResult.stdout.toString());
  console.error(processResult.stderr.toString());
}
