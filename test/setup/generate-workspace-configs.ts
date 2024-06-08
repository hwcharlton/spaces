import path from "node:path";
import fs from "node:fs";
import YAML from "yaml";
import { getConfigFolder } from "../../src/utils/retrieve-config";

/**
 * Cleans up (removes) generated simple configuration directory
 */
export type SimpleConfigCleanupFunction = () => void;

/**
 * Generates a workspace folder with config files named as specified.
 * Returns a function to clean up generated folder
 */
export function generateSimpleConfigs(
  configFiles: string[],
): SimpleConfigCleanupFunction {
  const configFolder = getConfigFolder();
  if (!folderIsOkayToUse(configFolder)) {
    throw new Error("Refusing to generate config folder: " + configFolder);
  }

  const workspacesFolder = path.join(configFolder, "workspaces");
  fs.mkdirSync(workspacesFolder, { recursive: true });

  for (let i = 0; i < configFiles.length; i++) {
    const configFile = configFiles[i];
    const configFilePath = path.join(workspacesFolder, configFile);
    fs.writeFileSync(
      configFilePath,
      YAML.stringify({
        "session-name": `session-${i}`,
      }),
    );
  }

  return () => removeSimpleConfigs(configFolder, configFiles);
}

export function removeSimpleConfigs(
  configPath: string,
  configFiles: string[],
): void {
  const workspacesFolder = path.join(configPath, "workspaces");
  fs.mkdirSync(workspacesFolder, { recursive: true });
  const dirItems = fs.readdirSync(workspacesFolder);
  if (dirItems.length !== configFiles.length) {
    throw new Error(
      `Refusing to clean up. Config path has ${dirItems.length} items, ` +
        `while simple config specified ${configFiles.length} files`,
    );
  }
  const configSet = new Set<string>();
  for (const configFile of configFiles) {
    configSet.add(configFile);
  }
  for (const dirItem of dirItems) {
    if (!configSet.has(dirItem)) {
      throw new Error(
        `Refusing to clean up. ` +
          `Directory item "${dirItem}" has no corresponding passed configuration parameter`,
      );
    }
  }

  fs.rmSync(configPath, { recursive: true });
}

function folderIsOkayToUse(folderPath: string): boolean {
  // If config folder doesn't exist, it's okay to create and use.
  if (!fs.existsSync(folderPath)) return true;

  // If specified folder is not directory, something went wrong.
  if (!fs.lstatSync(folderPath).isDirectory()) return false;

  // If folder is not empty, we should not use it.
  if (fs.readdirSync(folderPath).length > 0) return false;

  return true;
}
