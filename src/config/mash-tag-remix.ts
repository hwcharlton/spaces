import process from "node:process";
import path from "node:path";
import chalk from "chalk";
import { listSessions } from "../tmux/list-sessions.js";
import { newSession } from "../tmux/new-session.js";
import { switchClient } from "../tmux/switch-client.js";

const SESSION_NAME = "mash-tag-remix";

export function setupMashTagRemix() {
  // Check if session is already present and exit if it is
  {
    const runningSessions = listSessions();
    const isAlreadyLaunched = runningSessions.some((session) => {
      return session.sessionName === SESSION_NAME;
    });
    if (isAlreadyLaunched) {
      console.log(
        `Session ${chalk.blue.bold(SESSION_NAME)} is already running`,
      );
      return;
    }
  }

  newSession({
    sessionName: SESSION_NAME,
    startDirectory: getMashTagRemixPath(),
    windowName: "remix-ide",
    background: true,
  });
  switchClient({
    targetSession: SESSION_NAME,
  });
}

function getMashTagRemixPath(): string {
  const home = process.env.HOME;
  if (home === undefined) {
    throw new Error("$HOME is not set. Cannot get mash-tag-remix path.");
  }
  return path.join(home, "Developer", "work", "mash-tag-remix");
}
