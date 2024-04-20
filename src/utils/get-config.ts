import { PaneConfig, SessionConfig, WindowConfig } from "./types.js";

export function getSessionWindow(
  session: SessionConfig,
  window: string,
): WindowConfig {
  const windowConfig = session.windows[window];
  if (windowConfig === undefined) {
    throw new Error(
      `Could not find window config "${window}" for session config "${session.sessionName}"`,
    );
  }
  return windowConfig;
}

export function getWindowPane(window: WindowConfig, pane: string): PaneConfig {
  const paneConfig = window.panes[pane];
  if (paneConfig === undefined) {
    throw new Error(
      `Could not find pane config "${pane}" for window config "${window.windowName}"`,
    );
  }
  return paneConfig;
}
