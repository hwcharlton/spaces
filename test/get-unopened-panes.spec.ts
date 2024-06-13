import { afterAll, assert, beforeAll, describe, test, vi } from "vitest";
import { WorkspaceConfig, getConfigs } from "../src/utils/retrieve-config";
import { setConfigEnv, setSocketNameEnv } from "./helpers/set-env";
import { getUnopenedPanes } from "../src/utils/get-unopened-panes";
import { killServer } from "./helpers/kill-server";
import { openWorkspace } from "../src/utils/open-workspace";

describe("gets unopened panes", () => {
  let configs: Record<string, WorkspaceConfig> = {};
  beforeAll(() => {
    setSocketNameEnv("unopened");
    setConfigEnv("default");
    configs = getConfigs();
    openWorkspace(configs["typical-config"]);
  });
  afterAll(() => {
    killServer();
    vi.unstubAllEnvs();
  });

  test("from second session", () => {
    const configs = getConfigs();
    const typicalConfig = configs["typical-config"];
    const unopened = getUnopenedPanes(typicalConfig);
    assert.include(unopened, "second-shell");
    assert.notInclude(unopened, "shell");
  });
});
