import { TmuxError } from "./error-types.js";

export function throwTmuxError(message: string) {
  throw new TmuxError(message);
}
