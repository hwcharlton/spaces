import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { setConfigEnv } from "./helpers/set-env";
import { getConfigs } from "../src/utils/retrieve-config";

describe("getting configs", () => {
  beforeAll(() => {
    setConfigEnv("default");
    vi.stubEnv("HOME", "/test/home");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  test("config home directory gets expanded", () => {
    const configs = getConfigs();
    const typicalRoot = configs["typical-config"]["root-directory"];
    const secondRoot = configs["second-session"]["root-directory"];
    expect(typicalRoot).toEqual("/test/home");
    expect(secondRoot).toEqual("/test/home/project");
  });
});
