#!/usr/bin/env node
import inquirer from "inquirer";
import { setupMashTagRemix } from "./config/mash-tag-remix.js";

const SESSION_CHOICES: SessionChoice[] = [
  {
    name: "mash-tag-remix",
    launcher: setupMashTagRemix,
  },
];

type SessionChoice = {
  name: string;
  launcher: () => unknown;
};

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
