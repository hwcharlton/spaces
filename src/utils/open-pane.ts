import { listWindows } from "../tmux/list-windows.js";
import { selectPane } from "../tmux/select-pane.js";
import { splitWindow } from "../tmux/split-window.js";
import { getSessionByName } from "./get-by-name.js";
import { getSplit } from "./get-split.js";
import { getPaneConfig } from "./open-workspace.js";
import { WorkspaceConfig } from "./retrieve-config.js";

export function openPane(config: WorkspaceConfig, paneChoice: string) {
  const paneConfig = getPaneConfig(config, paneChoice);
  // TODO: Handle undefined posibility.
  const sessionId = getSessionByName(config["session-name"]!)!.id;
  // TODO: Allow multiple windows
  const windowId = listWindows({
    targetSession: sessionId,
    format: "#{window_id}",
  })
    .trim()
    .split("\n")[0];
  let split = getSplit(config, paneConfig, windowId!);
  if (split === undefined) {
    split = {
      startDirectory: paneConfig["start-directory"],
      shellCommand: paneConfig["shell-command"],
    };
  }
  if (split.startDirectory === undefined) {
    split.startDirectory = config["root-directory"];
  }
  split.format = "#{pane_id}";
  const newPaneId = splitWindow(split);
  selectPane({
    targetPane: newPaneId,
    title: paneChoice,
  });
}
