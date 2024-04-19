import { ListPanesOptions, listPanes } from "../tmux/list-panes.js";
import { PaneInfo } from "./types.js";

export type GetPanesOptions = {
  targetWindow?: string;
  listAll?: boolean;
};

export function getPanes(options?: GetPanesOptions) {
  const listPanesOptions: ListPanesOptions = {};
  if (typeof options?.targetWindow === "string") {
    listPanesOptions.target = options.targetWindow;
  }
  if (options?.listAll === true) {
    listPanesOptions.listAll = true;
  }
  listPanesOptions.format = "#{pane_id}\t#{pane_title}";
  const listPanesResult = listPanes(listPanesOptions).trim().split("\n");
  return parsePanes(listPanesResult);
}

export function parsePanes(paneLines: string[]): PaneInfo[] {
  const res: PaneInfo[] = [];
  for (const pane of paneLines) {
    const splitLine = pane.split("\t");
    res.push({
      id: splitLine[0],
      name: splitLine[1],
    });
  }
  return res;
}
