import { listSessions } from "../tmux/list-sessions.js";
import { newSession } from "../tmux/new-session.js";
import { selectPane } from "../tmux/select-pane.js";
import { splitWindow } from "../tmux/split-window.js";
import { switchClient } from "../tmux/switch-client.js";
import { PaneConfig, SessionConfig, WindowConfig } from "./types.js";

export function startSession(session: SessionConfig) {
  const runningSessions = listSessions({
    format: "#{session_name}",
  }).split("\n");
  const isAlreadyLaunched = runningSessions.includes(session.sessionName);
  if (isAlreadyLaunched) {
    switchClient({
      targetSession: session.sessionName,
    });
    return;
  }

  const firstWindowName = session.launchWindows[0];
  if (firstWindowName === undefined) {
    throw new Error(
      `Could not start session "${session.sessionName}" since there is no launch window`,
    );
  }
  const firstWindow = getSessionWindow(session, firstWindowName);
  launchFirstWindow(session, firstWindow);
  switchClient({
    targetSession: session.sessionName,
  });
}

function launchFirstWindow(session: SessionConfig, window: WindowConfig) {
  const firstPaneName = window.launchPanes[0];
  if (firstPaneName === undefined) {
    throw new Error(
      `Could not launch window "${window.windowName}" since there is no launch pane`,
    );
  }
  let targetPaneId: string | undefined;
  const firstPane = getWindowPane(window, firstPaneName);
  let currentPaneId = newSession({
    background: true,
    sessionName: session.sessionName,
    startDirectory: firstPane.startDirectory,
    shellCommand: firstPane.shellCommand,
    windowName: window.windowName,
    environment: firstPane.environment,
    format: "#{pane_id}",
  });
  if (firstPaneName === window.defaultPane) {
    targetPaneId = currentPaneId;
  }
  selectPane({
    targetPane: currentPaneId,
    title: firstPane.paneTitle,
  });
  for (let i = 1; i < window.launchPanes.length; i++) {
    const paneName = window.launchPanes[i]!;
    const pane = getWindowPane(window, paneName);
    const newPaneId = splitWindow({
      startDirectory: pane.startDirectory,
      targetPane: pane.target || currentPaneId,
      size: pane.size,
      environment: pane.environment,
      shellCommand: pane.shellCommand,
      leftOrAbove: pane.leftOrAbove,
      full: pane.fullSize,
      orientation: pane.splitOrientation,
      format: "#{pane_id}",
    });
    if (paneName === window.defaultPane) {
      targetPaneId = newPaneId;
    }
    selectPane({
      targetPane: newPaneId,
      title: pane.paneTitle,
    });
    currentPaneId = newPaneId;
  }
  if (typeof targetPaneId === "string") {
    selectPane({
      targetPane: targetPaneId,
    });
  }
}

function getSessionWindow(
  session: SessionConfig,
  window: string,
): WindowConfig {
  const windowConfig = session.windows[window];
  if (windowConfig === undefined) {
    throw new Error(
      `Could not find window config "${window}" for session config "${session.sessionName}"`,
    );
  }
  return windowConfig;
}

function getWindowPane(window: WindowConfig, pane: string): PaneConfig {
  const paneConfig = window.panes[pane];
  if (paneConfig === undefined) {
    throw new Error(
      `Could not find pane config "${pane}" for window config "${window.windowName}"`,
    );
  }
  return paneConfig;
}
