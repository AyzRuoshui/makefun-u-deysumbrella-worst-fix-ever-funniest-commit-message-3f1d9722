import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ENTRY_DIR = dirname(fileURLToPath(import.meta.url));
const MAIN_PATH = join(ENTRY_DIR, "main.ts");

function runEntry(outputDir: string): Buffer {
  execFileSync(process.execPath, [MAIN_PATH], {
    cwd: ENTRY_DIR,
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: outputDir },
    stdio: "pipe",
  });
  return readFileSync(join(outputDir, "entry.txt"));
}

test("writes a valid, deterministic one-line commit message <= 100 chars", () => {
  const out1 = mkdtempSync(join(tmpdir(), "worst-fix-test-1-"));
  const out2 = mkdtempSync(join(tmpdir(), "worst-fix-test-2-"));
  try {
    const buf1 = runEntry(out1);
    const buf2 = runEntry(join(out2, "nested", "output"));

    assert.equal(
      Buffer.compare(buf1, buf2),
      0,
      "Repeated runs must produce identical bytes",
    );

    const text = new TextDecoder("utf-8", { fatal: true }).decode(buf1);
    assert.ok(text.trim().length > 0, "Output must not be whitespace only");
    assert.ok(!/[\r\n]/.test(text), "Output must be a single line");

    const charCount = [...text].length;
    assert.ok(
      charCount >= 1 && charCount <= 100,
      `Expected 1..100 characters, got ${charCount}`,
    );
    assert.equal(text, text.trim(), "Output should have no leading/trailing spaces");
  } finally {
    rmSync(out1, { recursive: true, force: true });
    rmSync(out2, { recursive: true, force: true });
  }
});
