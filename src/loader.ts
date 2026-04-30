import * as fs from "fs";
import * as path from "path";

export type SchemaSource = string | object;

export interface LoadedSchema {
  schema: object;
  source: string;
}

export function loadSchema(source: SchemaSource): LoadedSchema {
  if (typeof source === "object") {
    return { schema: source, source: "<inline>" };
  }

  const filePath = path.resolve(source);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Schema file not found: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".json") {
    throw new Error(`Unsupported file extension "${ext}". Only .json files are supported.`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse JSON schema at ${filePath}: ${(err as Error).message}`);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Schema at ${filePath} must be a JSON object.`);
  }

  return { schema: parsed as object, source: filePath };
}

export function loadSchemaPair(
  baseSource: SchemaSource,
  headSource: SchemaSource
): { base: LoadedSchema; head: LoadedSchema } {
  return {
    base: loadSchema(baseSource),
    head: loadSchema(headSource),
  };
}
