import { ListPanesOptions, listPanes } from "../tmux/list-panes.js";
import { PaneInfo } from "./types.js";

export type GetPanesOptions = {
  targetWindow?: string;
  listAll?: boolean;
};

/**
 * Returns a list of objects that describe panes.
 * Set listAll to true to list panes in all sessions.
 * Set targetWindow to a string to target a specific window.
 */
export function getPanes(options?: GetPanesOptions): PaneInfo[] {
  const listPanesOptions: ListPanesOptions = {};
  if (typeof options?.targetWindow === "string") {
    listPanesOptions.target = options.targetWindow;
  }
  if (options?.listAll === true) {
    listPanesOptions.listAll = true;
  }
  listPanesOptions.format = "#{pane_id}\t#{pane_title}\t#{session_name}";
  const listPanesResult = listPanes(listPanesOptions).trim().split("\n");
  return parsePanes(listPanesResult);
}

/**
 * Takes strings that have tab-separated:
 *   - pane_id
 *   - pane_title
 *   - session_name
 * and returns objects with the parsed data.
 */
export function parsePanes(paneLines: string[]): PaneInfo[] {
  const res: PaneInfo[] = [];
  for (const pane of paneLines) {
    const splitLine = pane.split("\t");
    if (splitLine.length < 3) {
      continue;
    }
    res.push({
      id: splitLine[0]!,
      name: splitLine[1]!,
      sessionName: splitLine[2]!,
    });
  }
  return res;
}
