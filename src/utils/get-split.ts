import { SplitWindowOptions } from "../tmux/split-window.js";
import { getPaneByName } from "./get-by-name.js";
import { ConfigPane, WorkspaceConfig } from "./retrieve-config.js";

export function getSplit(
  config: WorkspaceConfig,
  pane: ConfigPane,
  windowId: string,
): Partial<SplitWindowOptions> | undefined {
  const splits = pane.split;
  if (splits === undefined) return;

  for (let i = 0; i < splits.length; i++) {
    const split = splits[i];
    let target = undefined;
    if (split?.target !== undefined) {
      target = windowId + "." + split.target;
    } else if (split?.["target-title"] !== undefined) {
      target = getPaneByName(split["target-title"], {
        targetSession: config["session-name"],
      })?.id;
    }
    if (target === undefined) continue;

    return {
      targetPane: target,
      startDirectory: pane["start-directory"],
      shellCommand: pane["shell-command"],
      full: split?.["full-size"],
      leftOrAbove: split?.["left-or-above"],
      orientation: split?.["split-orientation"],
      size: split?.size,
    };
  }
}
