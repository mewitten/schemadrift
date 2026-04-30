#!/usr/bin/env node
import { loadSchemaPair } from "./loader";
import { compareSchemas } from "./comparator";
import { formatReport } from "./reporter";

function printUsage(): void {
  console.error("Usage: schemadrift <base-schema.json> <head-schema.json> [--format text|markdown]");
}

function parseArgs(argv: string[]): { base: string; head: string; format: "text" | "markdown" } {
  const args = argv.slice(2);
  if (args.length < 2) {
    printUsage();
    process.exit(1);
  }

  const [base, head, ...rest] = args;
  let format: "text" | "markdown" = "text";

  const formatIdx = rest.indexOf("--format");
  if (formatIdx !== -1) {
    const value = rest[formatIdx + 1];
    if (value === "markdown" || value === "text") {
      format = value;
    } else {
      console.error(`Invalid format "${value}". Use "text" or "markdown".`);
      process.exit(1);
    }
  }

  return { base, head, format };
}

function main(): void {
  const { base, head, format } = parseArgs(process.argv);

  let baseSchema: object;
  let headSchema: object;

  try {
    const pair = loadSchemaPair(base, head);
    baseSchema = pair.base.schema;
    headSchema = pair.head.schema;
  } catch (err) {
    console.error(`Error loading schemas: ${(err as Error).message}`);
    process.exit(1);
  }

  const report = compareSchemas(baseSchema, headSchema);
  const output = formatReport(report, format);

  console.log(output);

  if (report.breaking.length > 0) {
    process.exit(1);
  }
}

main();
