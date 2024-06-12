import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { setConfigEnv, setSocketNameEnv } from "./helpers/set-env";
import { getConfigs } from "../src/utils/retrieve-config";
import { openWorkspace } from "../src/utils/open-workspace";
import { killServer } from "./helpers/kill-server";
import { getPaneByName, getSessionByName } from "../src/utils/get-by-name";
import { listPanes } from "../src/tmux/list-panes";

describe("opening default two workspaces", () => {
  beforeAll(() => {
    setSocketNameEnv("get-pane-by-name");
    setConfigEnv("default");
    const configs = getConfigs();
    const workspaceConfig = configs["typical-config"];
    openWorkspace(workspaceConfig);
    const secondConfig = configs["second-session"];
    openWorkspace(secondConfig);
  });
  afterAll(() => {
    killServer();
    vi.unstubAllEnvs();
  });

  test("can specify pane within session", () => {
    const typicalSession = getSessionByName("typical-session");
    const typicalPane = getPaneByName("shell", {
      targetSession: typicalSession?.id,
    });
    const secondSession = getSessionByName("second-session");
    const secondPane = getPaneByName("shell", {
      targetSession: secondSession?.id,
    });

    const typicalSessionLines = listPanes({
      target: typicalSession?.id,
      targetIsSession: true,
      format: "#{session_id}\t#{pane_id}",
    }).split("\n");
    const secondSessionLines = listPanes({
      target: secondSession?.id,
      targetIsSession: true,
      format: "#{session_id}\t#{pane_id}",
    }).split("\n");

    expect(typicalSessionLines).includes(
      `${typicalSession?.id}\t${typicalPane?.id}`,
    );
    expect(secondSessionLines).includes(
      `${secondSession?.id}\t${secondPane?.id}`,
    );
  });
});
