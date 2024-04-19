import { ListWindowsOptions, listWindows } from "../tmux/list-windows.js";
import { WindowInfo } from "./types.js";

export type GetWindowsOptions = {
  sessionName?: string;
};

export function getWindows(options?: GetWindowsOptions): WindowInfo[] {
  const listWindowsOptions: ListWindowsOptions = {};
  if (typeof options?.sessionName === "string") {
    listWindowsOptions.targetSession = options.sessionName;
  }
  listWindowsOptions.format = "#{window_id}\t#{window_name}";
  const listWindowsResult = listWindows(listWindowsOptions).trim().split("\n");
  const res: WindowInfo[] = [];
  for (const window of listWindowsResult) {
    const splitLine = window.split("\t");
    res.push({
      id: splitLine[0],
      name: splitLine[1],
    });
  }
  return res;
}
