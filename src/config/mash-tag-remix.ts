import process from "node:process";
import path from "node:path";
import chalk from "chalk";
import { listSessions } from "../tmux/list-sessions.js";
import { newSession } from "../tmux/new-session.js";
import { switchClient } from "../tmux/switch-client.js";
import { splitWindow } from "../tmux/split-window.js";

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

  const newSessionPane = newSession({
    shellCommand: "nvim .",
    sessionName: SESSION_NAME,
    startDirectory: getMashTagRemixPath(),
    windowName: "remix-ide",
    background: true,
    format: "#{pane_id}",
  });
  splitWindow({
    orientation: "vertical",
    size: "20%",
    targetPane: newSessionPane.trim(),
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
