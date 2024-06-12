import { parseArgs } from "node:util";

export function parseSpacesArgs(args: string[]) {
  const parsedArgs = parseArgs({
    args: args,
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
  return parsedArgs;
}
