import repl from "node:repl";
import { displayMenu } from "../tmux/display-menu.js";
import { displayMessage } from "../tmux/display-message.js";
import { listPanes } from "../tmux/list-panes.js";
import { listSessions } from "../tmux/list-sessions.js";
import { listWindows } from "../tmux/list-windows.js";
import { newSession } from "../tmux/new-session.js";
import { newWindow } from "../tmux/new-window.js";
import { runShell } from "../tmux/run-shell.js";
import { selectPane } from "../tmux/select-pane.js";
import { selectWindow } from "../tmux/select-window.js";
import { splitWindow } from "../tmux/split-window.js";
import { switchClient } from "../tmux/switch-client.js";

type FunctionMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [functionName: string]: (...args: any) => unknown;
};

export function launchRepl() {
  const replInstance = repl.start({});

  const replFunctions: FunctionMap = {
    displayMenu,
    displayMessage,
    listPanes,
    listSessions,
    listWindows,
    newSession,
    newWindow,
    runShell,
    selectPane,
    selectWindow,
    splitWindow,
    switchClient,
  };

  replInstance.context.tmux = {};
  for (const [functionName, func] of Object.entries(replFunctions)) {
    replInstance.context.tmux[functionName] = func;
  }
}
