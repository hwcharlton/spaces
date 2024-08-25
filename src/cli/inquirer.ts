import process from "node:process";
import { Buffer } from "node:buffer";
import { Readable, Transform } from "node:stream";
import { WorkspaceConfig } from "../utils/retrieve-config.js";
import { search } from "@inquirer/prompts";
import { openWorkspace } from "../utils/open-workspace.js";
import { openPane } from "../utils/open-pane.js";

const UP_KEY_BYTES = [27, 91, 65];
const DOWN_KEY_BYTES = [27, 91, 66];

/**
 * Takes CTRL-P and CTRL-N from stdin and maps them to
 * up and down keys for inquirer.
 */
export class ArrowTransform extends Transform {
  constructor() {
    super();
  }

  _transform(chunk: Buffer, _encoding: string, callback: () => unknown) {
    if (chunk.byteLength === 1 && chunk.at(0) === 16) {
      this.push(Buffer.from(UP_KEY_BYTES));
    } else if (chunk.byteLength === 1 && chunk.at(0) === 14) {
      this.push(Buffer.from(DOWN_KEY_BYTES));
    } else {
      this.push(chunk);
    }
    callback();
  }
}

export async function paneInquirerPrompt(
  config: WorkspaceConfig,
  unopenedPanes: string[],
) {
  const { tranformedStream, cleanup } = getModifiedInputStream();
  const choice = await search(
    {
      message: "Which pane to open?",
      theme: {
        helpMode: "never",
      },
      source: (term) => {
        return unopenedPanes
          .filter((pane) => {
            return pane.includes(term || "");
          })
          .map((pane) => ({
            value: pane,
          }));
      },
    },
    {
      input: tranformedStream,
    },
  );

  if (choice === undefined) return;
  console.log(choice);

  cleanup();
  openPane(config, choice);
}

export async function sessionInquirerPrompt(
  config: Record<string, WorkspaceConfig>,
) {
  const { tranformedStream, cleanup } = getModifiedInputStream();

  const choice = await search(
    {
      message: "Which session to start?",
      source: (term) =>
        Object.keys(config)
          .filter((item) => {
            return item.includes(term || "");
          })
          .map((configKey) => ({
            name: configKey,
            value: config[configKey],
          })),
    },
    {
      input: tranformedStream,
    },
  );

  if (choice === undefined) return;

  cleanup();
  openWorkspace(choice);
}

function getModifiedInputStream(): {
  tranformedStream: Readable;
  cleanup: () => void;
} {
  const stdinIsRaw = process.stdin.isRaw;
  const transform = new ArrowTransform();
  const closeOnCtrlC = (event: Buffer) => {
    if (event.toString() === "\u0003") {
      process.exit();
    }
  };

  process.stdin.setRawMode(true);
  process.stdin.on("data", closeOnCtrlC);

  const tranformedStream = Readable.from(process.stdin.pipe(transform));

  return {
    tranformedStream,
    cleanup: () => {
      process.stdin.removeListener("data", closeOnCtrlC);
      process.stdin.setRawMode(stdinIsRaw);
      process.stdin.unpipe(transform);
      tranformedStream.destroy();
    },
  };
}
