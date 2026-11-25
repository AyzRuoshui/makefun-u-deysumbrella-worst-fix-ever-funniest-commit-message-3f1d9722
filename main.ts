import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_MESSAGE_CHARS = 100;

const COMMIT_MESSAGE: string =
  "fix: stop random logouts by caching auth; everyone is Dave now";

/**
 * Resolve the output directory, honoring MAKEFUN_OUTPUT_DIR as a local
 * stand-in for the sandbox /output mount.
 */
function getOutputDir(): string {
  const configured: string | undefined = process.env.MAKEFUN_OUTPUT_DIR;
  if (configured !== undefined && configured.trim().length > 0) {
    return configured;
  }
  return "/output";
}

/**
 * Verify the commit message satisfies the competition gate before writing:
 * non-blank, single-line UTF-8 text of at most 100 Unicode characters.
 */
function validateCommitMessage(message: string): void {
  if (/[\r\n]/.test(message)) {
    throw new Error("Commit message must be a single line with no newlines.");
  }
  if (message.trim().length === 0) {
    throw new Error("Commit message must not be empty or whitespace only.");
  }
  const charCount = [...message].length;
  if (charCount < 1 || charCount > MAX_MESSAGE_CHARS) {
    throw new Error(
      `Commit message must be 1..${MAX_MESSAGE_CHARS} characters, got ${charCount}.`,
    );
  }
}

function main(): void {
  validateCommitMessage(COMMIT_MESSAGE);
  const outputDir = getOutputDir();
  mkdirSync(outputDir, { recursive: true });
  const outPath = join(outputDir, "entry.txt");
  writeFileSync(outPath, COMMIT_MESSAGE, "utf8");
}

main();
