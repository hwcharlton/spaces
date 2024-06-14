#!/usr/bin/env node
import process from "node:process";
import inquirer from "inquirer";
import { WorkspaceConfig, getConfigs } from "./utils/retrieve-config.js";
import { getPaneConfig, openWorkspace } from "./utils/open-workspace.js";
import { parseSpacesArgs } from "./cli/parse-args.js";
import { displayMessage } from "./tmux/display-message.js";
import { getUnopenedPanes } from "./utils/get-unopened-panes.js";
import { getSplit } from "./utils/get-split.js";
import { splitWindow } from "./tmux/split-window.js";
import { selectPane } from "./tmux/select-pane.js";
import { getSessionByName } from "./utils/get-by-name.js";
import { listWindows } from "./tmux/list-windows.js";
import { MenuOption, displayMenu } from "./tmux/display-menu.js";

type MenuType = "tmux" | "inquirer";

const configs = getConfigs();

const parsedArgs = parseSpacesArgs(process.argv.slice(2));

const chosenSession = parsedArgs.values.session;
const currentSession = displayMessage({
  toStdout: true,
  message: "#{session_name}",
});

const menuOption: MenuType =
  parsedArgs.values.menu === "tmux" ? "tmux" : "inquirer";

const firstPos = parsedArgs.positionals[0];

if (firstPos === "select") {
  if (parsedArgs.positionals[1] === "session") {
    askSession(menuOption);
  } else if (parsedArgs.positionals[1] === "pane") {
    askPane(menuOption);
  } else if (chosenSession === currentSession) {
    askPane(menuOption);
  } else {
    askSession(menuOption);
  }
} else if (firstPos === "open") {
  if (typeof parsedArgs.values.pane === "string") {
    const targetSession = chosenSession || currentSession;
    if (Object.keys(configs).includes(targetSession)) {
      openPane(configs[targetSession]!, parsedArgs.values.pane);
    } else {
      throw new Error(`Must specify session for ${parsedArgs.values.pane}`);
    }
  } else {
    if (parsedArgs.values.session === undefined) {
      throw new Error("Must specify session or pane to open");
    }

    // TODO: Handle undefined case
    openWorkspace(configs[parsedArgs.values.session]!);
  }
} else {
  if (Object.keys(configs).includes(currentSession)) {
    askPane(menuOption);
  } else {
    askSession(menuOption);
  }
}

function askPane(menuOption: MenuType) {
  const targetSession = chosenSession || currentSession;
  if (!Object.keys(configs).includes(targetSession)) {
    throw new Error(`No configuration for session: ${targetSession}`);
  }
  const config = configs[targetSession];
  if (config === undefined) {
    throw new Error(`No configuration for session: ${targetSession}`);
  }
  const unopenedPanes = getUnopenedPanes(config!);
  if (unopenedPanes.length === 0) {
    console.log("No panes to open!");
    return;
  }
  if (menuOption === "inquirer") {
    inquirer
      .prompt([
        {
          message: "Which pane to open?",
          name: "paneChoice",
          type: "list",
          choices: unopenedPanes,
        },
      ])
      .then((choices) => {
        openPane(config, choices.paneChoice);
      });
  } else {
    const menuOptions: MenuOption[] = [];
    for (const unopenedPane of unopenedPanes) {
      menuOptions.push({
        name: unopenedPane,
        command: `run-shell "spaces open --session ${targetSession} --pane ${unopenedPane}"`,
      });
    }
    displayMenu({ menuOptions });
  }
}

function askSession(menuOption: MenuType) {
  if (menuOption === "inquirer") {
    inquirer
      .prompt([
        {
          message: "Which session to start?",
          name: "sessionChoice",
          type: "list",
          choices: Object.keys(configs),
        },
      ])
      .then((choices) => {
        const chosenConfig = configs[choices.sessionChoice];
        if (chosenConfig === undefined) {
          return;
        }
        openWorkspace(chosenConfig);
      });
  } else {
    const menuOptions: MenuOption[] = [];
    for (const session of Object.keys(configs)) {
      menuOptions.push({
        name: session,
        command: `run-shell "spaces open --session ${session}"`,
      });
    }
    displayMenu({ menuOptions });
  }
}

function openPane(config: WorkspaceConfig, paneChoice: string) {
  const paneConfig = getPaneConfig(config, paneChoice);
  // TODO: Handle undefined posibility.
  const sessionId = getSessionByName(config["session-name"]!)!.id;
  // TODO: Allow multiple windows
  const windowId = listWindows({
    targetSession: sessionId,
    format: "#{window_id}",
  })
    .trim()
    .split("\n")[0];
  let split = getSplit(config, paneConfig, windowId!);
  if (split === undefined) {
    split = {
      startDirectory: paneConfig["start-directory"],
      shellCommand: paneConfig["shell-command"],
    };
  }
  if (split.startDirectory === undefined) {
    split.startDirectory = config["root-directory"];
  }
  split.format = "#{pane_id}";
  const newPaneId = splitWindow(split);
  selectPane({
    targetPane: newPaneId,
    title: paneChoice,
  });
}
