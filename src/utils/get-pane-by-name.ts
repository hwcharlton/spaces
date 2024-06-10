import { listPanes } from "../tmux/list-panes.js";
import { parsePanes } from "./get-panes.js";
import { PaneInfo } from "./types.js";

export type GetPaneByNameOptions = {
  targetWindow?: string;
};

export function getPaneByName(
  paneName: string,
  options?: GetPaneByNameOptions,
): PaneInfo | undefined {
  const listPanesResult = listPanes({
    target: options?.targetWindow,
    format: "#{pane_id}\t#{pane_title}\t#{session_name}",
  })
    .trim()
    .split("\n");
  const paneInfos = parsePanes(listPanesResult);
  return paneInfos.find((paneInfo) => paneInfo.name === paneName);
}
