import process from "node:process";
import path from "node:path";
import { selectPane } from "../tmux/select-pane.js";
import { getWindows } from "../utils/get-windows.js";
import { getPaneByName } from "../utils/get-pane-by-name.js";
import { selectWindow } from "../tmux/select-window.js";
import { PaneConfig, SessionConfig, WindowConfig } from "../utils/types.js";
import { startSession } from "../utils/start-session.js";
import { openWindow } from "../utils/open-window.js";
import { openPane } from "../utils/open-pane.js";

const SESSION_NAME = "mash-tag-remix";
const IDE_WINDOW_NAME = "remix-ide";
const NVIM_EDITOR_PANE_NAME = "ide-editor";
const SHELL_PANE_NAME = "shell";
const IDE_PANES: Record<string, PaneConfig> = {
  nvim: {
    paneTitle: NVIM_EDITOR_PANE_NAME,
    splitOrientation: "vertical",
    fullSize: true,
    leftOrAbove: true,
    shellCommand: "nvim .",
    startDirectory: getMashTagRemixPath(),
    size: "80%",
  },
  server: {
    paneTitle: "remix-server",
    target: `${SESSION_NAME}:${IDE_WINDOW_NAME}.bottom`,
    splitOrientation: "horizontal",
    shellCommand: "npm run dev",
    startDirectory: getMashTagRemixPath(),
  },
  shell: {
    paneTitle: SHELL_PANE_NAME,
    splitOrientation: "vertical",
    fullSize: true,
    startDirectory: getMashTagRemixPath(),
    size: "20%",
  },
};
const WINDOWS: Record<string, WindowConfig> = {
  ide: {
    windowName: IDE_WINDOW_NAME,
    defaultPane: "nvim",
    launchPanes: ["nvim", "shell"],
    panes: IDE_PANES,
  },
};
const SESSION: SessionConfig = {
  launchWindows: ["ide"],
  sessionName: SESSION_NAME,
  windows: WINDOWS,
};

export function setupMashTagRemix() {
  startSession(SESSION);
}

export const actions: Record<string, () => unknown> = {
  nvim: openNvim,
  server: openRemixServer,
};

// Action functions

function openNvim() {
  if (createIdeWindow(SESSION)) {
    return;
  }
  const targetWindow = `${SESSION.sessionName}:${SESSION.windows["ide"]?.windowName}`;
  const nvimPane = getPaneByName(NVIM_EDITOR_PANE_NAME, { targetWindow });
  if (nvimPane !== undefined) {
    selectWindow({ targetWindow });
    selectPane({ targetPane: nvimPane.id });
    return;
  }
  openPane(SESSION, {
    window: "ide",
    pane: "nvim",
    target: `${targetWindow}.bottom-left`,
    focus: true,
  });
}

function openRemixServer() {
  if (createIdeWindow(SESSION)) {
    return;
  }
  openPane(SESSION, {
    window: "ide",
    pane: "server",
  });
}

// Utility functions

/** Returns true if new window was created, and false if already present */
function createIdeWindow(session: SessionConfig): boolean {
  const windows = getWindows({ sessionName: session.sessionName });
  if (windows.some((window) => window.name === IDE_WINDOW_NAME)) {
    return false;
  }
  openWindow(session, "ide");
  return true;
}

function getMashTagRemixPath(): string {
  const home = process.env.HOME;
  if (home === undefined) {
    throw new Error("$HOME is not set. Cannot get mash-tag-remix path.");
  }
  return path.join(home, "Developer", "work", "mash-tag", "mash-tag-remix");
}
