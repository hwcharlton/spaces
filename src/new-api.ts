import inquirer from "inquirer";
import { getConfigs } from "./utils/retrieve-config.js";
import { openWorkspace } from "./utils/open-workspace.js";

const configs = getConfigs();

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
