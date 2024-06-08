import { assert, beforeAll, test, vi, describe, afterAll } from "vitest";
import { setConfigEnv } from "./helpers/set-env";
import {
  getConfigFolder,
  getWorkspacesFolder,
  listConfigs,
} from "../src/utils/retrieve-config";
import path from "path";
import {
  SimpleConfigCleanupFunction,
  generateSimpleConfigs,
} from "./setup/generate-workspace-configs";

const TEST_FILES = ["tEst.yAMl", "file.yaml.yaml", "-session.yaml-", ".yaml"];

describe("lists workspace configurations", () => {
  let folderCleanupCallback: SimpleConfigCleanupFunction | undefined;
  beforeAll(() => {
    setConfigEnv("test-temp");
    folderCleanupCallback = generateSimpleConfigs(TEST_FILES);
  });

  afterAll(() => {
    if (folderCleanupCallback) folderCleanupCallback();
    vi.unstubAllEnvs();
  });

  test("retrieves list of config files", () => {
    const workspaceFolder = getWorkspacesFolder();
    const configs = listConfigs();
    assert.sameMembers(
      configs.map((config) => config.configName),
      ["tEst", "file.yaml"],
    );
    assert.sameMembers(
      configs.map((config) => config.configPath),
      ["tEst.yAMl", "file.yaml.yaml"].map((filename) =>
        path.join(workspaceFolder, filename),
      ),
    );
  });
});

describe("without using test configuration environment", () => {
  test("finds default home config folder", ({ onTestFinished }) => {
    onTestFinished(async () => {
      vi.unstubAllEnvs();
    });

    const testHome = path.join("/", "test", "home");

    vi.stubEnv("SPACES_CONFIG_DIR", "");
    vi.stubEnv("XDG_CONFIG_HOME", "");
    vi.stubEnv("HOME", testHome);

    const configFolder = getConfigFolder();
    assert.strictEqual(configFolder, path.join(testHome, ".config", "spaces"));
  });

  test("finds XDG config folder", ({ onTestFinished }) => {
    onTestFinished(async () => {
      vi.unstubAllEnvs();
    });

    const testXdg = path.join("/", "xdg", "home", "config");

    vi.stubEnv("SPACES_CONFIG_DIR", "");
    vi.stubEnv("HOME", "/wrong/home");
    vi.stubEnv("XDG_CONFIG_HOME", testXdg);

    const configFolder = getConfigFolder();
    assert.strictEqual(configFolder, path.join(testXdg, "spaces"));
  });

  test("finds spaces config folder", ({ onTestFinished }) => {
    onTestFinished(async () => {
      vi.unstubAllEnvs();
    });

    const testConfigDir = path.join("/", "my", "home", "spaces");

    vi.stubEnv("SPACES_CONFIG_DIR", testConfigDir);
    vi.stubEnv("HOME", "/wrong/home");
    vi.stubEnv("XDG_CONFIG_HOME", "/wrong/xdg/home/.config");

    const configFolder = getConfigFolder();
    assert.strictEqual(configFolder, path.join(testConfigDir));
  });
});

describe("with using test configuration environment", () => {
  let envFolder: string | undefined;
  beforeAll(() => {
    envFolder = setConfigEnv("default");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  test("finds test config folder", () => {
    const configFolder = getConfigFolder();
    assert.strictEqual(configFolder, envFolder);
  });
});
