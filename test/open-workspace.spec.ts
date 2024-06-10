import { afterAll, assert, beforeAll, describe, test, vi } from "vitest";
import { setConfigEnv, setSocketNameEnv } from "./helpers/set-env";
import { openWorkspace } from "../src/utils/open-workspace";
import { getConfigs } from "../src/utils/retrieve-config";
import { getPaneByName } from "../src/utils/get-pane-by-name";
import { killServer } from "./helpers/kill-server";
import { listPanes } from "../src/tmux/list-panes";
import { checkEnvVar } from "./helpers/check-env-var";

describe("opening default workspace", () => {
  beforeAll(() => {
    setSocketNameEnv("test");
    setConfigEnv("default");
    const configs = getConfigs();
    const workspaceConfig = configs["typical-config"];
    openWorkspace(workspaceConfig);
  });
  afterAll(() => {
    killServer();
    vi.unstubAllEnvs();
  });

  test("has intended windows and panes", async () => {
    const windows = listPanes({
      listAll: true,
      format: "#{session_name}\t#{window_name}\t#{pane_title}",
    }).split("\n");
    assert.sameOrderedMembers(windows, [
      "typical-session\tide\teditor",
      "typical-session\tide\tshell",
    ]);
  });

  test("sets intended environmental variables", async () => {
    const shellPane = getPaneByName("shell");
    assert.isDefined(shellPane);
    const testEnvValue = await checkEnvVar("SPACES_ENV_TEST_FOO", {
      targetPane: shellPane!.id,
    });
    assert.strictEqual(testEnvValue, "bar");
  });
});
