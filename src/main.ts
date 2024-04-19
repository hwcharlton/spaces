#!/usr/bin/env node
import inquirer from "inquirer";
import {
  setupMashTagRemix,
  actions as mashTagActions,
} from "./config/mash-tag-remix.js";
import { displayMessage } from "./tmux/display-message.js";

type SessionChoice = {
  name: string;
  launcher: () => unknown;
  actions: Record<string, () => unknown>;
};

const SESSION_CHOICES: SessionChoice[] = [
  {
    name: "mash-tag-remix",
    launcher: setupMashTagRemix,
    actions: mashTagActions,
  },
];

const currentSession = displayMessage({
  toStdout: true,
  message: "#{session_name}",
}).trim();

const currentSessionOptions = getSessionOptions(currentSession);

if (currentSessionOptions === undefined) {
  launchPrompt();
} else {
  actionPrompt(currentSessionOptions);
}

function launchPrompt() {
  inquirer
    .prompt([
      {
        message: "Which session to start?",
        name: "sessionChoice",
        type: "list",
        choices: SESSION_CHOICES.map((choice) => choice.name),
      },
    ])
    .then((choice) => {
      const chosenSession = choice.sessionChoice;
      const launcher = SESSION_CHOICES.find((sessionOption) => {
        return sessionOption.name === chosenSession;
      })?.launcher;
      if (launcher !== undefined) {
        launcher();
      }
    });
}

function actionPrompt(session: SessionChoice) {
  inquirer
    .prompt([
      {
        message: "Which action?",
        name: "actionChoice",
        type: "list",
        choices: Object.keys(session.actions),
      },
    ])
    .then((choice) => {
      const chosenAction = choice.actionChoice;
      const action = session.actions[chosenAction];
      if (typeof action === "function") {
        action();
      }
    });
}

function getSessionOptions(sessionName: string): SessionChoice | undefined {
  const sessionOptions = SESSION_CHOICES.find((sessionChoice) => {
    return sessionChoice.name === sessionName;
  });
  return sessionOptions;
}
