import { newWindow } from "../tmux/new-window.js";
import { selectPane } from "../tmux/select-pane.js";
import { splitWindow } from "../tmux/split-window.js";
import { getSessionWindow, getWindowPane } from "./get-config.js";
import { SessionConfig, WindowConfig } from "./types.js";

export function openWindow(session: SessionConfig, windowName: string) {
  const window = getSessionWindow(session, windowName);
  const firstPaneName = window.launchPanes[0];
  if (firstPaneName === undefined) {
    throw new Error(
      `No launch panes for window ${session.sessionName}:${window.windowName}`,
    );
  }
  let targetPaneId: string | undefined;
  const firstPane = getWindowPane(window, firstPaneName);
  const currentPaneId = newWindow({
    windowName: window.windowName,
    targetWindow: `${session.sessionName}:$`,
    relativePosition: "after",
    startDirectory: firstPane.startDirectory,
    environment: firstPane.environment,
    shellCommand: firstPane.shellCommand,
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

export function launchRemainingPanes(
  window: WindowConfig,
  firstPaneId: string,
): string | undefined {
  let currentPaneId = firstPaneId;
  let targetPaneId: string | undefined;
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
  return targetPaneId;
}
