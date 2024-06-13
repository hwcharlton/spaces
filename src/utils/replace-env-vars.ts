const LOWER_A_CHAR_CODE = "a".charCodeAt(0);
const UPPER_A_CHAR_CODE = "A".charCodeAt(0);
const UNDERSCORE_CHAR_CODE = "_".charCodeAt(0);

export function replaceEnvVars(input: string): string {
  let escapeNext = false;
  let isInEnvVar = false;
  let envVarStart = 0;
  const pieces: string[] = [];
  let pieceStart = 0;

  for (let i = 0; i < input.length; i++) {
    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    const char = input[i];

    // Inside env var
    if (isInEnvVar) {
      let varName: string | undefined;

      if (!isEnvVarChar(char!)) {
        varName = input.substring(envVarStart + 1, i);
        isInEnvVar = false;
        pieceStart = i;
      } else if (i === input.length - 1) {
        varName = input.substring(envVarStart + 1, input.length);
      }

      if (typeof varName === "string") {
        pieces.push(process.env[varName] || "");
      }

      // Not inside env var
    } else {
      // Backslash escaping (for intentional '$' or '\')
      if (char === "\\") {
        pieces.push(input.substring(pieceStart, i));
        pieceStart = i + 1;
        escapeNext = true;

        // Entering env var
      } else if (char === "$") {
        pieces.push(input.substring(pieceStart, i));
        envVarStart = i;
        isInEnvVar = true;
      }
    }
  }

  // If last character was not env var, push remaining piece to contents
  if (!isInEnvVar) {
    pieces.push(input.substring(pieceStart, input.length));
  }

  return pieces.join("");
}

function isEnvVarChar(char: string): boolean {
  const charCode = char.charCodeAt(0);
  return (
    (charCode >= LOWER_A_CHAR_CODE && charCode < LOWER_A_CHAR_CODE + 26) ||
    (charCode >= UPPER_A_CHAR_CODE && charCode < UPPER_A_CHAR_CODE + 26) ||
    charCode === UNDERSCORE_CHAR_CODE
  );
}
