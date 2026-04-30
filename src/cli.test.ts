import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execSync, ExecSyncOptionsWithStringEncoding } from "child_process";

const CLI = path.resolve(__dirname, "../src/cli.ts");
const execOpts: ExecSyncOptionsWithStringEncoding = { encoding: "utf-8", stdio: "pipe" };

function writeTempSchema(data: object): string {
  const file = path.join(os.tmpdir(), `schema-${Date.now()}-${Math.random()}.json`);
  fs.writeFileSync(file, JSON.stringify(data), "utf-8");
  return file;
}

function runCli(args: string, expectFail = false): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(`ts-node ${CLI} ${args}`, execOpts);
    return { stdout, stderr: "", code: 0 };
  } catch (err: unknown) {
    const e = err as { stdout: string; stderr: string; status: number };
    return { stdout: e.stdout ?? "", stderr: e.stderr ?? "", code: e.status ?? 1 };
  }
}

describe("CLI", () => {
  it("exits 0 and reports no changes for identical schemas", () => {
    const schema = { type: "object", properties: { id: { type: "string" } } };
    const base = writeTempSchema(schema);
    const head = writeTempSchema(schema);
    const result = runCli(`${base} ${head}`);
    expect(result.code).toBe(0);
    fs.unlinkSync(base);
    fs.unlinkSync(head);
  });

  it("exits 1 when breaking changes are detected", () => {
    const base = writeTempSchema({ type: "object", required: ["id"], properties: { id: { type: "string" } } });
    const head = writeTempSchema({ type: "object", properties: {} });
    const result = runCli(`${base} ${head}`, true);
    expect(result.code).toBe(1);
    fs.unlinkSync(base);
    fs.unlinkSync(head);
  });

  it("outputs markdown format when --format markdown is passed", () => {
    const schema = { type: "object" };
    const base = writeTempSchema(schema);
    const head = writeTempSchema(schema);
    const result = runCli(`${base} ${head} --format markdown`);
    expect(result.stdout).toContain("#");
    fs.unlinkSync(base);
    fs.unlinkSync(head);
  });

  it("exits 1 and prints error for missing file", () => {
    const result = runCli("/no/such/base.json /no/such/head.json", true);
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/Error loading schemas/);
  });
});
