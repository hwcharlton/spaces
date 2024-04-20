import { EnvVar, Orientation } from "../tmux/types.js";

export type SessionConfig = {
  sessionName: string;
  launchWindows: string[];
  windows: Record<string, WindowConfig>;
};

export type WindowConfig = {
  windowName: string;
  defaultPane: string;
  launchPanes: string[];
  panes: Record<string, PaneConfig>;
};

export type PaneConfig = {
  paneTitle?: string;
  startDirectory?: string;
  shellCommand?: string;
  size?: string;
  fullSize?: boolean;
  target?: string;
  splitOrientation?: Orientation;
  environment?: EnvVar[];
  leftOrAbove?: boolean;
};

export type WindowInfo = {
  name: string;
  id: string;
};

export type PaneInfo = {
  name: string;
  id: string;
};
