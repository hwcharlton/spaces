import path from "node:path";
import fs from "node:fs";

export function getSpacesRoot(testPath?: string): string {
  if (testPath === undefined) {
    testPath = path.resolve(".");
  }

  while (testPath.length > 1) {
    if (checkIfRoot(testPath)) {
      return testPath;
    }
    testPath = path.join(testPath, "..");
  }
  throw new Error("Could not locate spaces root directory");
}

function checkIfRoot(testPath: string): boolean {
  const dirContents = fs.readdirSync(testPath);
  const packageJson = dirContents.find((filename) => {
    if (filename.toLowerCase() !== "package.json") return false;
    const filepath = path.join(testPath, filename);
    return fs.lstatSync(filepath).isFile();
  });
  if (packageJson === undefined) {
    return false;
  }
  const packageJsonPath = path.join(testPath, packageJson);
  const packageJsonContents = fs.readFileSync(packageJsonPath).toString();
  const parsedPackage = JSON.parse(packageJsonContents);
  if (typeof parsedPackage !== "object" || parsedPackage === null) {
    return false;
  }
  const packageName = parsedPackage["name"];
  return packageName === "spaces";
}
