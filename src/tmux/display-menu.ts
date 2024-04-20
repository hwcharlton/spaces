import child_process from "node:child_process";

export type MenuOption = {
  name?: string;
  key?: string;
  command?: string;
};

export type DisplayMenuOptions = {
  targetClient?: string;
  targetPane?: string;
  title?: string;
  xPosition?: string;
  yPosition?: string;
  menuOptions: MenuOption[];
  requireMouseClick?: boolean;
};

export function displayMenu(options: DisplayMenuOptions) {
  const args: string[] = ["display-menu"];
  if (typeof options.targetPane === "string") {
    args.push("-t", options.targetPane);
  }
  if (typeof options.targetClient === "string") {
    args.push("-c", options.targetClient);
  }
  if (typeof options.title === "string") {
    args.push("-T", options.title);
  }
  if (typeof options.xPosition === "string") {
    args.push("-x", options.xPosition);
  }
  if (typeof options.yPosition === "string") {
    args.push("-y", options.yPosition);
  }
  if (options.requireMouseClick === true) {
    args.push("-O");
  }
  insertMenuOptions(args, options.menuOptions);
  child_process.spawnSync("tmux", args);
}

function insertMenuOptions(args: string[], menuOptions: MenuOption[]) {
  for (const menuOption of menuOptions) {
    if (menuOption.name === undefined || menuOption.name.length === 0) {
      args.push("");
      continue;
    }
    if (menuOption.command === undefined) {
      throw new Error("Cannot have undefined command for named menu option");
    }
    args.push(menuOption.name, menuOption.key || "", menuOption.command);
  }
}
