import { PaneConfig, SessionConfig, WindowConfig } from "./types.js";

/**
 * Retrieve window configuration from session configuration
 */
export function getSessionWindowConfig(
  session: SessionConfig,
  windowName: string,
): WindowConfig {
  const windowConfig = session.windows[windowName];
  if (windowConfig === undefined) {
    throw new Error(
      `Could not find window config "${windowName}" for session config "${session.sessionName}"`,
    );
  }
  return windowConfig;
}

/**
 * Retrieve pane configuration from window configuration
 */
export function getWindowPaneConfig(
  window: WindowConfig,
  pane: string,
): PaneConfig {
  const paneConfig = window.panes[pane];
  if (paneConfig === undefined) {
    throw new Error(
      `Could not find pane config "${pane}" for window config "${window.windowName}"`,
    );
  }
  return paneConfig;
}
