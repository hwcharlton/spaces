import { listPanes } from "../tmux/list-panes.js";
import { getSessionByName } from "./get-by-name.js";
import { WorkspaceConfig } from "./retrieve-config.js";

export function getUnopenedPanes(config: WorkspaceConfig): string[] {
  const sessionName = config["session-name"];
  if (typeof sessionName !== "string") {
    throw new Error("Cannot retrieve unopened panes for unnamed session");
  }
  const session = getSessionByName(sessionName);
  if (typeof session?.id !== "string") {
    throw new Error("Could not find session id for " + sessionName);
  }
  const panes = listPanes({
    targetIsSession: true,
    target: session.id,
    format: "#{pane_title}",
  })
    .trim()
    .split("\n");
  const unopenedPanes: string[] = [];
  for (const paneTitle of Object.keys(config.panes)) {
    if (!panes.includes(paneTitle)) {
      unopenedPanes.push(paneTitle);
    }
  }
  return unopenedPanes;
}
