import { assert, beforeAll, test, vi, describe, afterAll } from "vitest";
import { setConfigEnv } from "./helpers/set-env";
import { getConfigFolder } from "../src/utils/retrieve-config";
import path from "path";
import { getSpacesRoot } from "./helpers/get-spaces-root";

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
  beforeAll(() => {
    setConfigEnv("default");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  test("finds test config folder", () => {
    const configFolder = getConfigFolder();
    assert.strictEqual(
      configFolder,
      path.join(getSpacesRoot(), "test", "test-config", "default"),
    );
  });
});
