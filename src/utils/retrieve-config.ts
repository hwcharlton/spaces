import path from "node:path";

export function getConfigFolder(): string {
  {
    const spacesConfigDir = process.env["SPACES_CONFIG_DIR"];
    if (typeof spacesConfigDir === "string" && spacesConfigDir.length > 0)
      return spacesConfigDir;
  }

  {
    const xdgConfigHome = process.env["XDG_CONFIG_HOME"];
    if (typeof xdgConfigHome === "string" && xdgConfigHome.length > 0) {
      return path.join(xdgConfigHome, "spaces");
    }
  }

  {
    const home = process.env["HOME"];
    if (typeof home === "string" && home.length > 0) {
      return path.join(home, ".config", "spaces");
    }
  }

  throw new Error("Cannot determine configuration directory");
}
