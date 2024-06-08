import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { vi } from "vitest";

export function setSocketNameEnv(name: string) {
  vi.stubEnv("SPACES_TMUX_SOCKET_NAME", name);
}

export function setConfigEnv(configName: string): string {
  const tempPath = fs.mkdtempSync(path.join(os.tmpdir(), configName));
  vi.stubEnv("SPACES_CONFIG_DIR", tempPath);
  return tempPath;
}
