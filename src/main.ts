#!/usr/bin/env node
import { parseArgs } from "node:util";
import process from "node:process";
import inquirer from "inquirer";
import {
  setupMashTagRemix,
  actions as mashTagActions,
} from "./config/mash-tag-remix.js";
import {
  setupMashTagStrapi,
  actions as strapiActions,
} from "./config/mash-tag-strapi.js";
import {
  setupMashTagCdk,
  actions as cdkActions,
} from "./config/mash-tag-cdk.js";
import { displayMessage } from "./tmux/display-message.js";
import { SessionChoice } from "./utils/types.js";
import { MenuOption, displayMenu } from "./tmux/display-menu.js";

const SESSION_CHOICES: SessionChoice[] = [
  {
    name: "mash-tag-remix",
    launcher: setupMashTagRemix,
    actions: mashTagActions,
  },
  {
    name: "mash-tag-strapi",
    launcher: setupMashTagStrapi,
    actions: strapiActions,
  },
  {
    name: "mash-tag-cdk",
    launcher: setupMashTagCdk,
    actions: cdkActions,
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
    // Set prompting to inquirer or tmux (defaults to inquirer)
    menu: {
      type: "string",
      short: "m",
    },
  },
  allowPositionals: true,
});

const chosenSession = parsedArgs.values.session;
const targetSessionChoice = getSessionOptions(chosenSession || currentSession);
const firstPositional = parsedArgs.positionals[0];

if (parsedArgs.values.action !== undefined) {
  if (targetSessionChoice === undefined) {
    throw new Error(
      `Cannot launch action "${parsedArgs.values.action}" for undefined session`,
    );
  }
  performAction(targetSessionChoice, parsedArgs.values.action);
} else if (parsedArgs.values.session !== undefined) {
  targetSessionChoice?.launcher();
} else {
  const menuOption = parsedArgs.values.menu || "inquirer";
  if (menuOption === "inquirer") {
    runPrompt(targetSessionChoice, firstPositional);
  } else if (menuOption === "tmux") {
    runMenu(targetSessionChoice, firstPositional);
  }
}

if (chosenSession !== undefined && chosenSession !== currentSession) {
  targetSessionChoice?.launcher();
}

function runMenu(
  sessionOptions: SessionChoice | undefined,
  firstArg: string | undefined,
) {
  const menuOptions: MenuOption[] = [];
  if (firstArg === "select" || sessionOptions === undefined) {
    for (const sessionChoice of SESSION_CHOICES) {
      menuOptions.push({
        name: sessionChoice.name,
        command: `run-shell "spaces --session ${sessionChoice.name}"`,
      });
    }
  } else {
    for (const actionKey of Object.keys(sessionOptions.actions)) {
      menuOptions.push({
        name: actionKey,
        command: `run-shell "spaces --action ${actionKey}"`,
      });
    }
  }
  displayMenu({ menuOptions });
}

function runPrompt(
  sessionOptions: SessionChoice | undefined,
  firstArg: string | undefined,
) {
  if (firstArg === "select" || sessionOptions === undefined) {
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
