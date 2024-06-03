import { listSessions } from "../tmux/list-sessions.js";
import { newSession } from "../tmux/new-session.js";
import { selectPane } from "../tmux/select-pane.js";
import { switchClient } from "../tmux/switch-client.js";
import { getSessionWindowConfig, getWindowPaneConfig } from "./get-config.js";
import { launchRemainingPanes } from "./open-window.js";
import { SessionConfig, WindowConfig } from "./types.js";

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
  const firstWindow = getSessionWindowConfig(session, firstWindowName);
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
  const firstPane = getWindowPaneConfig(window, firstPaneName);
  const currentPaneId = newSession({
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
  targetPaneId = launchRemainingPanes(window, currentPaneId) || targetPaneId;
  if (typeof targetPaneId === "string") {
    selectPane({
      targetPane: targetPaneId,
    });
  }
}
