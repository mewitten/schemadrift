import { JSONSchema7 } from 'json-schema';

export type ChangeType = 'breaking' | 'non-breaking' | 'info';

export interface SchemaChange {
  path: string;
  type: ChangeType;
  message: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export function compareSchemas(
  oldSchema: JSONSchema7,
  newSchema: JSONSchema7,
  path = '#'
): SchemaChange[] {
  const changes: SchemaChange[] = [];

  // Type change
  if (oldSchema.type !== newSchema.type) {
    changes.push({
      path,
      type: 'breaking',
      message: `Type changed from '${oldSchema.type}' to '${newSchema.type}'`,
      oldValue: oldSchema.type,
      newValue: newSchema.type,
    });
  }

  // Required fields added
  const oldRequired = oldSchema.required ?? [];
  const newRequired = newSchema.required ?? [];
  for (const field of newRequired) {
    if (!oldRequired.includes(field)) {
      changes.push({
        path: `${path}/required`,
        type: 'breaking',
        message: `Required field '${field}' was added`,
        newValue: field,
      });
    }
  }

  // Required fields removed
  for (const field of oldRequired) {
    if (!newRequired.includes(field)) {
      changes.push({
        path: `${path}/required`,
        type: 'non-breaking',
        message: `Required field '${field}' was removed`,
        oldValue: field,
      });
    }
  }

  // Properties removed (breaking)
  const oldProps = oldSchema.properties ?? {};
  const newProps = newSchema.properties ?? {};
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps)) {
      changes.push({
        path: `${path}/properties/${key}`,
        type: 'breaking',
        message: `Property '${key}' was removed`,
        oldValue: oldProps[key],
      });
    }
  }

  // Properties added (non-breaking)
  for (const key of Object.keys(newProps)) {
    if (!(key in oldProps)) {
      changes.push({
        path: `${path}/properties/${key}`,
        type: 'non-breaking',
        message: `Property '${key}' was added`,
        newValue: newProps[key],
      });
    } else {
      // Recurse into matching properties
      const nested = compareSchemas(
        oldProps[key] as JSONSchema7,
        newProps[key] as JSONSchema7,
        `${path}/properties/${key}`
      );
      changes.push(...nested);
    }
  }

  return changes;
}
