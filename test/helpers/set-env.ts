import path from "node:path";
import { vi } from "vitest";
import { getSpacesRoot } from "./get-spaces-root";

export function setSocketNameEnv(name: string) {
  vi.stubEnv("SPACES_TMUX_SOCKET_NAME", name);
}

export function setConfigEnv(configName: string) {
  vi.stubEnv(
    "SPACES_CONFIG_DIR",
    path.join(getSpacesRoot(), "test", "test-config", configName),
  );
}
