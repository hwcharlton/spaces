import process from "node:process";
import path from "node:path";
import fs from "node:fs";
import YAML from "yaml";
import { Orientation } from "../tmux/types.js";
import { replaceEnvVars } from "./replace-env-vars.js";

export type WorkspaceConfig = {
  "session-name"?: string;
  "root-directory"?: string;
  "launch-windows"?: string[];
  panes: Record<string, ConfigPane>;
  windows: Record<string, ConfigWindow>;
  environment: Record<string, string>;
  [key: string]: unknown;
};

export type ConfigPane = {
  "shell-command"?: string;
  split?: PaneTarget[];
  "start-directory"?: string;
};

export type ConfigWindow = {
  title?: string;
  "default-pane"?: string;
  "launch-panes"?: string[];
};

export type PaneTarget = {
  target?: string;
  "target-title"?: string;
  "split-orientation"?: Orientation;
  "full-size"?: boolean;
  size?: string;
  "left-or-above"?: boolean;
};

export type ConfigFileInfo = {
  configName: string;
  configPath: string;
};

const YAML_MATCHER = /\.yaml$/i;

export function getConfigs(): Record<string, WorkspaceConfig> {
  const configFiles = listConfigs();
  const configs: Record<string, WorkspaceConfig> = {};
  for (const configFile of configFiles) {
    const fileContents = fs.readFileSync(configFile.configPath, {
      encoding: "utf8",
    });
    const config = YAML.parse(fileContents);
    config["root-directory"] = replaceEnvVars(config["root-directory"] || "");
    configs[configFile.configName] = config;
  }
  return configs;
}

export function listConfigs(): ConfigFileInfo[] {
  const workspaceFolder = getWorkspacesFolder();
  const configNames = fs.readdirSync(workspaceFolder);
  return configNames
    .map((configName) => {
      const regexResult = YAML_MATCHER.exec(configName);
      const matchIndex = regexResult?.index;
      return {
        filename: configName,
        isMatch: regexResult !== null,
        matchIndex,
      };
    })
    .filter((matchResult) => {
      return matchResult.isMatch && (matchResult.matchIndex || 0) > 0;
    })
    .map((matchResult) => {
      const name = matchResult.filename.substring(0, matchResult.matchIndex);
      return {
        configName: name,
        configPath: path.join(workspaceFolder, matchResult.filename),
      };
    });
}

export function getWorkspacesFolder(): string {
  const workspacesPath = path.join(getConfigFolder(), "workspaces");
  if (!fs.lstatSync(workspacesPath).isDirectory()) {
    throw new Error("Workspaces directory not present in config folder");
  }
  return workspacesPath;
}

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
