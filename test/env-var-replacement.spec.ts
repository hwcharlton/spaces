import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { replaceEnvVars } from "../src/utils/replace-env-vars";

describe("replacing env vars in strings", () => {
  beforeAll(() => {
    vi.stubEnv("HOME", "/user/home");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });
  test("replaces $HOME", () => {
    expect(replaceEnvVars("$HOME/Developer")).toEqual("/user/home/Developer");
  });
  test("does not replace env var with backspace escape", () => {
    expect(replaceEnvVars("\\$HOME/Developer")).toEqual("$HOME/Developer");
  });
});
