import { listPanes } from "../tmux/list-panes.js";
import { listSessions } from "../tmux/list-sessions.js";
import { parsePanes } from "./get-panes.js";
import { PaneInfo, SessionInfo } from "./types.js";

export type GetPaneByNameOptions = {
  targetWindow?: string;
  targetSession?: string;
};

export function getSessionByName(sessionName: string): SessionInfo | undefined {
  const sessionList = listSessions({
    format: "#{session_id}\t#{session_name}",
  })
    .trim()
    .split("\n");
  return sessionList
    .map((listItem) => {
      const splitItem = listItem.split("\t");
      return {
        id: splitItem[0]!,
        name: splitItem[1]!,
      };
    })
    .find((item) => item.name === sessionName);
}

export function getPaneByName(
  paneName: string,
  options?: GetPaneByNameOptions,
): PaneInfo | undefined {
  const targetIsSession = options?.targetSession !== undefined;
  if (targetIsSession && options.targetWindow !== undefined) {
    throw new Error("Cannot specifiy target session and window at same time");
  }
  const listPanesResult = listPanes({
    target: options?.targetSession || options?.targetWindow,
    format: "#{pane_id}\t#{pane_title}\t#{session_name}",
    targetIsSession,
  })
    .trim()
    .split("\n");
  const paneInfos = parsePanes(listPanesResult);
  return paneInfos.find((paneInfo) => paneInfo.name === paneName);
}
