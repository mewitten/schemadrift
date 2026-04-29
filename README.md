# schemadrift

> A lightweight library to detect and report breaking changes between JSON Schema versions in CI pipelines.

---

## Installation

```bash
npm install schemadrift
```

---

## Usage

```typescript
import { detectDrift } from "schemadrift";

const oldSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
  required: ["name"],
};

const newSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
  },
  required: ["name", "age"],
};

const result = detectDrift(oldSchema, newSchema);

if (result.hasBreakingChanges) {
  console.error("Breaking changes detected:");
  result.changes.forEach((change) => console.error(`  - ${change.message}`));
  process.exit(1);
}
```

### CI Integration

Add a drift check to your pipeline by running:

```bash
npx schemadrift --old schema.v1.json --new schema.v2.json
```

Exit code `1` is returned when breaking changes are found, making it easy to fail CI builds automatically.

---

## License

[MIT](./LICENSE)