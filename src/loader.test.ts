import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { loadSchema, loadSchemaPair } from "./loader";

function writeTempJson(data: unknown): string {
  const file = path.join(os.tmpdir(), `schema-${Date.now()}-${Math.random()}.json`);
  fs.writeFileSync(file, JSON.stringify(data), "utf-8");
  return file;
}

describe("loadSchema", () => {
  it("returns inline object schemas directly", () => {
    const schema = { type: "object", properties: { id: { type: "string" } } };
    const result = loadSchema(schema);
    expect(result.schema).toBe(schema);
    expect(result.source).toBe("<inline>");
  });

  it("loads a valid JSON schema from a file path", () => {
    const schema = { type: "object", properties: { name: { type: "string" } } };
    const file = writeTempJson(schema);
    const result = loadSchema(file);
    expect(result.schema).toEqual(schema);
    expect(result.source).toBe(path.resolve(file));
    fs.unlinkSync(file);
  });

  it("throws if file does not exist", () => {
    expect(() => loadSchema("/nonexistent/path/schema.json")).toThrow("Schema file not found");
  });

  it("throws if file extension is not .json", () => {
    const file = path.join(os.tmpdir(), `schema-${Date.now()}.yaml`);
    fs.writeFileSync(file, "type: object");
    expect(() => loadSchema(file)).toThrow("Unsupported file extension");
    fs.unlinkSync(file);
  });

  it("throws if file contains invalid JSON", () => {
    const file = path.join(os.tmpdir(), `schema-${Date.now()}.json`);
    fs.writeFileSync(file, "{ invalid json ");
    expect(() => loadSchema(file)).toThrow("Failed to parse JSON schema");
    fs.unlinkSync(file);
  });

  it("throws if JSON is not an object", () => {
    const file = writeTempJson([1, 2, 3]);
    expect(() => loadSchema(file)).toThrow("must be a JSON object");
    fs.unlinkSync(file);
  });
});

describe("loadSchemaPair", () => {
  it("loads both base and head schemas", () => {
    const base = { type: "object" };
    const head = { type: "object", properties: { id: { type: "number" } } };
    const result = loadSchemaPair(base, head);
    expect(result.base.schema).toEqual(base);
    expect(result.head.schema).toEqual(head);
  });
});
