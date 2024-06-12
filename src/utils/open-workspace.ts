import { newSession } from "../tmux/new-session.js";
import { selectPane } from "../tmux/select-pane.js";
import { splitWindow } from "../tmux/split-window.js";
import { switchClient } from "../tmux/switch-client.js";
import { EnvVar } from "../tmux/types.js";
import { getServerStatus } from "./get-server-status.js";
import { getSplit } from "./get-split.js";
import {
  ConfigPane,
  ConfigWindow,
  WorkspaceConfig,
} from "./retrieve-config.js";

export function openWorkspace(config: WorkspaceConfig) {
  if (config["session-name"] === undefined) {
    throw new Error("Cannot open workspace without session name");
  }
  if (config["launch-windows"] === undefined) {
    throw new Error("Cannot open workspace without launch-windows");
  }
  const serverStatus = getServerStatus();
  let alreadyLaunched = false;
  if (
    serverStatus.isRunning &&
    serverStatus.sessions?.includes(config["session-name"])
  ) {
    alreadyLaunched = true;
  }

  if (alreadyLaunched) {
    switchClient({
      targetSession: config["session-name"],
    });
    return;
  }

  const launchWindows = config["launch-windows"];
  const firstWindowName = launchWindows[0];
  if (typeof firstWindowName !== "string") {
    throw new Error(
      "Value for first launch window was not a string, " +
        `but instead "${typeof firstWindowName}"`,
    );
  }
  launchFirstWindow(config, firstWindowName);
  switchClient({
    targetSession: config["session-name"],
  });
}

function launchFirstWindow(config: WorkspaceConfig, windowName: string) {
  const windowConfig = getWindowConfig(config, windowName);
  const launchPanes = windowConfig["launch-panes"];
  if (!Array.isArray(launchPanes) || launchPanes.length === 0) {
    throw new Error(`No launch panes for window "${windowName}"`);
  }

  const firstPaneName = launchPanes[0];
  if (typeof firstPaneName !== "string") {
    throw new Error(
      `Launch pane value was not string but "${typeof firstPaneName}"`,
    );
  }

  const firstPaneConfig = getPaneConfig(config, firstPaneName);

  const envVars: EnvVar[] = Object.entries(config.environment).map(
    ([name, value]) => {
      return { name, value };
    },
  );

  let targetPaneId: string | undefined;
  const [currentPaneId, windowId] = newSession({
    background: true,
    sessionName: config["session-name"],
    startDirectory: config["root-directory"],
    shellCommand: firstPaneConfig["shell-command"],
    windowName: windowName,
    environment: envVars,
    format: "#{pane_id}\t#{window_id}",
  })
    .trim()
    .split("\t");

  if (firstPaneName === windowConfig["default-pane"]) {
    targetPaneId = currentPaneId;
  }
  selectPane({
    targetPane: currentPaneId,
    title: firstPaneName,
  });
  targetPaneId =
    launchRemainingPanes(config, windowName, currentPaneId!, windowId!) ||
    targetPaneId;
  if (typeof targetPaneId === "string") {
    selectPane({
      targetPane: targetPaneId,
    });
  }
}

function launchRemainingPanes(
  config: WorkspaceConfig,
  windowName: string,
  firstPaneId: string,
  windowId: string,
): string | undefined {
  let currentPaneId = firstPaneId;
  let targetPaneId: string | undefined;

  const windowConfig = getWindowConfig(config, windowName);
  const launchPanes = windowConfig["launch-panes"];
  if (!Array.isArray(launchPanes) || launchPanes.length <= 1) return;

  for (let i = 1; i < launchPanes.length; i++) {
    const paneName = launchPanes[i];
    if (typeof paneName !== "string") {
      throw new Error(
        `Pane name was not string but instead "${typeof paneName}"`,
      );
    }
    const paneConfig = getPaneConfig(config, paneName);
    let split = getSplit(config, paneConfig, windowId);
    if (split === undefined) {
      split = {
        startDirectory: paneConfig["start-directory"],
        shellCommand: paneConfig["shell-command"],
      };
    }
    if (split.targetPane === undefined) {
      split.targetPane = currentPaneId;
    }
    const newPaneId = splitWindow(split);
    if (paneName === windowConfig["default-pane"]) {
      targetPaneId = newPaneId;
    }
    selectPane({
      targetPane: newPaneId,
      title: paneName,
    });
    currentPaneId = newPaneId;
  }
  return targetPaneId;
}

function getWindowConfig(
  config: WorkspaceConfig,
  windowName: string,
): ConfigWindow {
  const windows = config.windows;
  if (typeof windows !== "object" || windows === null) {
    throw Error("No windows configuration found in workspace config");
  }
  const windowConfig = windows[windowName];
  if (typeof windowConfig !== "object" || windowConfig === null) {
    throw Error(`No window named ${windowName} found in workspace config`);
  }
  return windowConfig;
}

function getPaneConfig(config: WorkspaceConfig, paneName: string): ConfigPane {
  const panes = config.panes;
  if (typeof panes !== "object" || panes === null) {
    throw Error("No panes configuration found in workspace config");
  }
  const paneConfig = panes[paneName];
  if (typeof paneConfig !== "object" || paneConfig === null) {
    throw Error(`No pane named ${paneName} found in workspace config`);
  }
  return paneConfig;
}
