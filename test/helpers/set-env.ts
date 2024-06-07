import { vi } from "vitest";

export function setSocketNameEnv(name: string) {
  vi.stubEnv("SPACES_TMUX_SOCKET_NAME", name);
}
