import { parseArgs } from "node:util";

export function parseSpacesArgs(args: string[]) {
  const parsedArgs = parseArgs({
    args: args,
    options: {
      pane: {
        type: "string",
        short: "p",
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
  return parsedArgs;
}
