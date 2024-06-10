import { runTmuxWithArgs } from "./utils.js";

export type SendKeysOptions = {
  repeat?: number;
  targetPane?: string;
  hexadecimal?: boolean;
  targetClient?: string;
  disableLookup?: boolean;
  resetTerminal?: boolean;
  mouseEvent?: boolean;
  messages: string[];
  copyMode?: boolean;
  expandFormat?: boolean;
};

export function sendKeys(options: SendKeysOptions) {
  const args: string[] = ["send-keys"];
  if (typeof options.repeat === "number") {
    args.push("-N", options.repeat.toString(10));
  }
  if (typeof options.targetPane === "string") {
    args.push("-t", options.targetPane);
  }
  if (options.hexadecimal === true) {
    args.push("-H");
  }
  if (typeof options.targetClient === "string") {
    args.push("-K", "-c", options.targetClient);
  }
  if (options.disableLookup === true) {
    args.push("-l");
  }
  if (options.mouseEvent === true) {
    args.push("-M");
  }
  if (options.resetTerminal === true) {
    args.push("-R");
  }
  if (options.copyMode === true) {
    args.push("-X");
  }
  if (options.expandFormat === true) {
    args.push("-F");
  }
  args.push(...options.messages);
  runTmuxWithArgs(args);
}
