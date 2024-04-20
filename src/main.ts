#!/usr/bin/env node
import { parseArgs } from "node:util";
import process from "node:process";
import inquirer from "inquirer";
import {
  setupMashTagRemix,
  actions as mashTagActions,
} from "./config/mash-tag-remix.js";
import { displayMessage } from "./tmux/display-message.js";
import { SessionChoice } from "./utils/types.js";
import { MenuOption, displayMenu } from "./tmux/display-menu.js";

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
});

const commandArgs = process.argv.slice(2);
const parsedArgs = parseArgs({
  args: commandArgs,
  options: {
    action: {
      type: "string",
      short: "a",
    },
    session: {
      type: "string",
      short: "s",
    },
    menu: {
      type: "string",
      short: "m",
    },
  },
  allowPositionals: true,
});

const chosenSession = parsedArgs.values.session || currentSession;
const currentSessionOptions = getSessionOptions(chosenSession);

if (parsedArgs.values.action !== undefined) {
  if (currentSessionOptions === undefined) {
    throw new Error(
      `Cannot launch action "${parsedArgs.values.action}" for undefined session`,
    );
  }
  performAction(currentSessionOptions, parsedArgs.values.action);
} else {
  const menuOption = parsedArgs.values.menu || "inquirer";
  if (menuOption === "inquirer") {
    runPrompt(currentSessionOptions);
  } else if (menuOption === "tmux") {
    runMenu(currentSessionOptions);
  }
}

function runMenu(sessionOptions: SessionChoice | undefined) {
  if (sessionOptions === undefined || sessionOptions.actions === undefined) {
    throw new Error("tmux menu only implemented for action choice");
  }
  const menuOptions: MenuOption[] = [];
  for (const actionKey of Object.keys(sessionOptions.actions)) {
    menuOptions.push({
      name: actionKey,
      command: `run-shell "spaces --action ${actionKey}"`,
    });
  }
  displayMenu({ menuOptions });
}

function runPrompt(sessionOptions: SessionChoice | undefined) {
  if (sessionOptions === undefined) {
    launchPrompt();
  } else {
    actionPrompt(sessionOptions);
  }
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
      performAction(session, choice.actionChoice);
    });
}

function getSessionOptions(sessionName: string): SessionChoice | undefined {
  const sessionOptions = SESSION_CHOICES.find((sessionChoice) => {
    return sessionChoice.name === sessionName;
  });
  return sessionOptions;
}

function performAction(sessionOptions: SessionChoice, action: string) {
  const actionFunction = sessionOptions.actions[action];
  if (typeof actionFunction === "function") {
    actionFunction();
  } else {
    throw new Error(`Could not find action: ${action}`);
  }
}
