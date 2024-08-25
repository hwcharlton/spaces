#!/usr/bin/env node

import process from "node:process";
import { getConfigs } from "./utils/retrieve-config.js";
import { openWorkspace } from "./utils/open-workspace.js";
import { parseSpacesArgs } from "./cli/parse-args.js";
import { displayMessage } from "./tmux/display-message.js";
import { getUnopenedPanes } from "./utils/get-unopened-panes.js";
import { MenuOption, displayMenu } from "./tmux/display-menu.js";
import { paneInquirerPrompt, sessionInquirerPrompt } from "./cli/inquirer.js";
import { openPane } from "./utils/open-pane.js";

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
    await askSession(menuOption);
  } else if (parsedArgs.positionals[1] === "pane") {
    await askPane(menuOption);
  } else if (chosenSession === currentSession) {
    await askPane(menuOption);
  } else {
    await askSession(menuOption);
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
    await askPane(menuOption);
  } else {
    await askSession(menuOption);
  }
}

async function askPane(menuOption: MenuType) {
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
    paneInquirerPrompt(config, unopenedPanes);
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

async function askSession(menuOption: MenuType) {
  if (menuOption === "inquirer") {
    await sessionInquirerPrompt(configs);
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
