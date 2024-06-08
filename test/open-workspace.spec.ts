import { afterAll, assert, beforeAll, describe, test } from "vitest";
import { setConfigEnv } from "./helpers/set-env";
import { openWorkspace } from "../src/utils/open-workspace";
import { getConfigs } from "../src/utils/retrieve-config";
import { killServer } from "./helpers/kill-server";
import { listPanes } from "../src/tmux/list-panes";

describe("opening default workspace", () => {
  beforeAll(() => {
    setConfigEnv("default");
  });
  afterAll(() => {
    killServer();
  });
  test("do test", () => {
    const configs = getConfigs();
    const workspaceConfig = configs["typical-config"];
    openWorkspace(workspaceConfig);
    const windows = listPanes({
      listAll: true,
      format: "#{session_name}\t#{window_name}\t#{pane_title}",
    }).split("\n");
    assert.sameOrderedMembers(windows, [
      "typical-session\tide\teditor",
      "typical-session\tide\tshell",
    ]);
  });
});
