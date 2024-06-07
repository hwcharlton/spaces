import { runTmuxWithArgs } from "./utils.js";
import { CardinalDirection, EnableChoice, SetOrClear } from "./types.js";

export type SelectPaneOptions = {
  targetPane?: string;
  title?: string;
  keepZoom?: boolean;
  relativeDirection?: CardinalDirection;
  lastPane?: boolean;
  enableInput?: EnableChoice;
  markPane?: SetOrClear;
};

const DIRECTION_ARGS: Record<CardinalDirection, string> = {
  up: "-U",
  down: "-D",
  left: "-L",
  right: "-R",
};

const ENABLE_INPUT_ARGS: Record<EnableChoice, string> = {
  enable: "-e",
  disable: "-d",
};

const MARK_PANE_ARGS: Record<SetOrClear, string> = {
  set: "-m",
  clear: "-M",
};

export function selectPane(options?: SelectPaneOptions) {
  const args: string[] = ["select-pane"];
  if (typeof options?.targetPane === "string") {
    args.push("-t", options.targetPane);
  }
  if (typeof options?.title === "string") {
    args.push("-T", options.title);
  }
  if (options?.keepZoom === true) {
    args.push("-Z");
  }
  if (typeof options?.relativeDirection === "string") {
    args.push(DIRECTION_ARGS[options.relativeDirection]);
  }
  if (options?.lastPane === true) {
    args.push("-l");
  }
  if (typeof options?.enableInput === "string") {
    args.push(ENABLE_INPUT_ARGS[options.enableInput]);
  }
  if (typeof options?.markPane === "string") {
    args.push(MARK_PANE_ARGS[options.markPane]);
  }
  runTmuxWithArgs(args);
}
