import { listSessions, newSession } from "../sessions.js";
import chalk from "chalk";

const SESSION_NAME = "mash-tag-remix";

export function setupMashTagRemix() {
  // Check if session is already present and exit if it is
  {
    const runningSessions = listSessions();
    const isAlreadyLaunched = runningSessions.some((session) => {
      return session.sessionName === SESSION_NAME;
    });
    if (isAlreadyLaunched) {
      console.log(
        `Session ${chalk.blue.bold(SESSION_NAME)} is already running`,
      );
      return;
    }
  }

  newSession({
    sessionName: SESSION_NAME,
    background: true,
  });
}
