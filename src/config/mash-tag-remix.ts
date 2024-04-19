import process from "node:process";
import path from "node:path";
import chalk from "chalk";
import { listSessions } from "../tmux/list-sessions.js";
import { newSession } from "../tmux/new-session.js";
import { switchClient } from "../tmux/switch-client.js";
import { splitWindow } from "../tmux/split-window.js";
import { selectPane } from "../tmux/select-pane.js";
import { getWindows } from "../utils/get-windows.js";
import { newWindow } from "../tmux/new-window.js";
import { getPaneByName } from "../utils/get-pane-by-name.js";

const SESSION_NAME = "mash-tag-remix";
const IDE_WINDOW_NAME = "remix-ide";

export function setupMashTagRemix() {
  // Check if session is already present and exit if it is
  {
    const runningSessions = listSessions({
      format: "#{session_name}",
    })
      .trim()
      .split("\n");
    const isAlreadyLaunched = runningSessions.includes(SESSION_NAME);
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
    windowName: IDE_WINDOW_NAME,
    background: true,
    format: "#{pane_id}",
  }).trim();
  selectPane({
    targetPane: newSessionPane,
    title: "nvim",
  });
  openIdeShell(newSessionPane);
  switchClient({
    targetSession: SESSION_NAME,
  });
}

export const actions: Record<string, () => unknown> = {
  nvim: openNvim,
};

// Action functions

function openNvim() {
  if (createIdeWindow()) {
    return;
  }
  const nvimPane = getPaneByName("nvim", {
    targetWindow: `${SESSION_NAME}:${IDE_WINDOW_NAME}`,
  });
  if (nvimPane !== undefined) {
    throw new Error("nvim is already open");
  }
  const nvimPaneId = splitWindow({
    startDirectory: getMashTagRemixPath(),
    format: "#{pane_id}",
    full: true,
    targetPane: `${SESSION_NAME}:${IDE_WINDOW_NAME}.bottom-left`,
    shellCommand: "nvim .",
    orientation: "vertical",
    size: "80%",
    leftOrAbove: true,
  }).trim();
  selectPane({
    targetPane: nvimPaneId,
    title: "nvim",
  });
}

// Utility functions

/** Returns true if new window was created, and false if already present */
function createIdeWindow(): boolean {
  const windows = getWindows({ sessionName: SESSION_NAME });
  if (windows.some((window) => window.name === IDE_WINDOW_NAME)) {
    return false;
  }
  const newWindowPane = newWindow({
    windowName: IDE_WINDOW_NAME,
    startDirectory: getMashTagRemixPath(),
    shellCommand: "nvim .",
    format: "#{pane_id}",
  });
  selectPane({
    targetPane: newWindowPane,
    title: "nvim",
  });
  openIdeShell(newWindowPane);
  return true;
}

function openIdeShell(targetPane: string): string {
  const shellPane = splitWindow({
    orientation: "vertical",
    size: "20%",
    targetPane: targetPane,
    format: "#{pane_id}",
  }).trim();
  selectPane({
    targetPane: shellPane,
    title: "shell",
  });
  return shellPane;
}

function getMashTagRemixPath(): string {
  const home = process.env.HOME;
  if (home === undefined) {
    throw new Error("$HOME is not set. Cannot get mash-tag-remix path.");
  }
  return path.join(home, "Developer", "work", "mash-tag", "mash-tag-remix");
}
