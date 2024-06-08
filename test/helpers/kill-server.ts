import { killSession } from "../../src/tmux/kill-session";
import { getServerStatus } from "../../src/utils/get-server-status";

export function killServer(): void {
  const serverStatus = getServerStatus();
  if (!serverStatus.isRunning || serverStatus.sessions === undefined) return;

  for (const session of serverStatus.sessions) {
    killSession({
      target: session,
    });
  }
}
