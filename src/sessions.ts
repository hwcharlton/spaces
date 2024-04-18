import * as child_process from "node:child_process";

type SessionInfo = {
  sessionName: string;
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
