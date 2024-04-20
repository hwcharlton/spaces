import process from "node:process";
import path from "node:path";
import { splitWindow } from "../tmux/split-window.js";
import { selectPane } from "../tmux/select-pane.js";
import { getWindows } from "../utils/get-windows.js";
import { newWindow } from "../tmux/new-window.js";
import { getPaneByName } from "../utils/get-pane-by-name.js";
import { selectWindow } from "../tmux/select-window.js";
import { PaneConfig, SessionConfig, WindowConfig } from "../utils/types.js";
import { startSession } from "../utils/start-session.js";

const SESSION_NAME = "mash-tag-remix";
const IDE_WINDOW_NAME = "remix-ide";
const IDE_PANES: Record<string, PaneConfig> = {
  nvim: {
    paneTitle: "nvim-ide",
    splitOrientation: "vertical",
    fullSize: true,
    leftOrAbove: true,
    shellCommand: "nvim .",
    startDirectory: getMashTagRemixPath(),
    size: "80%",
  },
  shell: {
    paneTitle: "remix-shell",
    splitOrientation: "vertical",
    fullSize: true,
    startDirectory: getMashTagRemixPath(),
    size: "20%",
  },
};
const WINDOWS: Record<string, WindowConfig> = {
  ide: {
    windowName: "remix-ide",
    defaultPane: "nvim",
    launchPanes: ["nvim", "shell"],
    panes: IDE_PANES,
  },
};
const SESSION: SessionConfig = {
  launchWindows: ["ide"],
  sessionName: "mash-tag-remix",
  windows: WINDOWS,
};

export function setupMashTagRemix() {
  startSession(SESSION);
  process.exit();
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
    selectWindow({
      targetWindow: `${SESSION_NAME}:${IDE_WINDOW_NAME}`,
    });
    selectPane({
      targetPane: nvimPane.id,
    });
    return;
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
    startDirectory: getMashTagRemixPath(),
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
