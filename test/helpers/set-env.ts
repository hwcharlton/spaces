import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { vi } from "vitest";
import { getSpacesRoot } from "./get-spaces-root";

export function setSocketNameEnv(name: string) {
  vi.stubEnv("SPACES_TMUX_SOCKET_NAME", name);
}

export function setConfigEnv(configName: string) {
  const configPath = path.join(
    getSpacesRoot(),
    "test",
    "test-config",
    configName,
  );
  vi.stubEnv("SPACES_CONFIG_DIR", configPath);
}

export function setTmpConfigEnv(configName: string): string {
  const tempPath = fs.mkdtempSync(path.join(os.tmpdir(), configName));
  vi.stubEnv("SPACES_CONFIG_DIR", tempPath);
  return tempPath;
}
