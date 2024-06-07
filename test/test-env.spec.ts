import { beforeAll, assert, test } from "vitest";
import { killSession } from "../src/tmux/kill-session";
import { newSession } from "../src/tmux/new-session";
import { displayMessage } from "../src/tmux/display-message";
import { setSocketNameEnv } from "./helpers/set-env";

/*
 * Tests that "setSocketNameEnv" properly makes tmux commands
 * use the designated socket, and that there are no pre-
 * existing sessions present within said socket.
 */

beforeAll(() => {
  setSocketNameEnv("spaces-test");
});

test("starts with test socket", ({ onTestFinished }) => {
  const sessionName = "test-session";
  newSession({
    sessionName: sessionName,
    background: true,
  });
  onTestFinished(() => {
    killSession({
      target: sessionName,
    });
  });
  assert.strictEqual(
    displayMessage({
      message: `#{server_sessions} #{session_name}`,
      toStdout: true,
    }),
    `1 ${sessionName}`,
  );
});
