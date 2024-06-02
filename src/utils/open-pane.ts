import { displayMessage } from "../tmux/display-message.js";
import { selectPane } from "../tmux/select-pane.js";
import { selectWindow } from "../tmux/select-window.js";
import { splitWindow } from "../tmux/split-window.js";
import { switchClient } from "../tmux/switch-client.js";
import { getSessionWindow, getWindowPane } from "./get-config.js";
import { SessionConfig } from "./types.js";

export type OpenPaneOptions = {
  window: string;
  pane: string;
  focus?: boolean;
  target?: string;
};

export function openPane(
  session: SessionConfig,
  options: OpenPaneOptions,
): string {
  const window = getSessionWindow(session, options.window);
  const pane = getWindowPane(window, options.pane);
  const oldPaneId = displayMessage({
    message: "#{pane_id}",
    toStdout: true,
  });
  const newPaneId = splitWindow({
    format: "#{pane_id}",
    full: pane.fullSize,
    size: pane.size,
    shellCommand: pane.shellCommand,
    environment: pane.environment,
    startDirectory: pane.startDirectory,
    targetPane: options?.target || pane.target,
    leftOrAbove: pane.leftOrAbove,
    orientation: pane.splitOrientation,
  });
  selectPane({
    targetPane: newPaneId,
    title: pane.paneTitle,
  });
  const targetWindow = `${session.sessionName}:${window.windowName}`;
  if (options?.focus === true) {
    switchClient({
      targetSession: session.sessionName,
    });
    selectWindow({ targetWindow });
    selectPane({
      targetPane: newPaneId,
    });
  } else {
    selectPane({
      targetPane: oldPaneId,
    });
  }
  return newPaneId;
}
