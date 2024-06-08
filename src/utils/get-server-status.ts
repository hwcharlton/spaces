import { TmuxError } from "../errors/error-types.js";
import { listSessions } from "../tmux/list-sessions.js";

export type ServerStatus = {
  isRunning: boolean;
  sessions?: string[];
};

export function getServerStatus(): ServerStatus {
  try {
    const runningSessions = listSessions({
      format: "#{session_name}",
    }).split("\n");
    return {
      isRunning: true,
      sessions: runningSessions,
    };
  } catch (e) {
    if (!(e instanceof TmuxError)) {
      throw new Error("Unexpected error retrieving sessions");
    } else {
      return {
        isRunning: false,
      };
    }
  }
}
