# SchemaDrift Built-in Rules

This document describes the built-in breaking-change detection rules included with SchemaDrift.

---

## `required-field-removed`

**Severity:** error

Triggered when a field that was listed in `required` in the old schema is no longer present in the new schema's `required` array.

**Example:**
```json
// Old
{ "required": ["id", "name"] }

// New — BREAKING
{ "required": ["id"] }
```

---

## `type-changed`

**Severity:** error

Triggered when the `type` of a schema changes between versions. Changing a type is always a breaking change for consumers relying on the previous type.

**Example:**
```json
// Old
{ "type": "string" }

// New — BREAKING
{ "type": "number" }
```

---

## `property-removed`

**Severity:** error

Triggered when a property defined in `properties` in the old schema is absent from the new schema's `properties`.

**Example:**
```json
// Old
{ "properties": { "id": {}, "name": {} } }

// New — BREAKING
{ "properties": { "id": {} } }
```

---

## `enum-value-removed`

**Severity:** error

Triggered when a value present in an `enum` array in the old schema is no longer present in the new schema. Removing enum values restricts previously valid data.

**Example:**
```json
// Old
{ "enum": ["active", "inactive", "pending"] }

// New — BREAKING
{ "enum": ["active", "inactive"] }
```

---

## Adding Custom Rules

You can supply your own rules by implementing the `Rule` type exported from `rules.ts`:

```typescript
import { Rule } from './rules';

const myRule: Rule = (oldSchema, newSchema, path = '#') => {
  // return RuleViolation[] 
  return [];
};
```

Pass custom rules to `compareSchemas` via the `rules` option.
