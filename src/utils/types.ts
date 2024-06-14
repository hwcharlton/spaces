export type WindowInfo = {
  name: string;
  id: string;
};

export type PaneInfo = {
  name: string;
  id: string;
  sessionName?: string;
};

export type SessionInfo = {
  name: string;
  id: string;
};

export type SessionChoice = {
  name: string;
  launcher: () => unknown;
  actions: Record<string, () => unknown>;
};
