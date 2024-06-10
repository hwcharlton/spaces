import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { sendKeys } from "../../src/tmux/send-keys";

export type CheckEnvVarOptions = {
  targetPane?: string;
};

const sleep = async (t: number) => {
  return new Promise((r) => setTimeout(r, t));
};

export async function checkEnvVar(
  varName: string,
  options?: CheckEnvVarOptions,
) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "echo-out"));
  sendKeys({
    targetPane: options?.targetPane,
    messages: [`echo -n "\${${varName}}" > ${tempDir}/var`, "enter"],
  });
  const startTime = Date.now();
  let val: string | undefined;
  while (Date.now() - startTime < 5 * 1000) {
    try {
      val = fs.readFileSync(path.join(tempDir, "var"), { encoding: "utf-8" });
      if (typeof val === "string") {
        fs.rmSync(tempDir, {
          recursive: true,
        });
        return val;
      }
    } catch (e) {
      if (typeof e.errno !== "number" || e.errno !== -2) {
        fs.rmSync(tempDir, {
          recursive: true,
        });
        throw Error("Unexpected error");
      }
    }
    await sleep(100);
  }
}
