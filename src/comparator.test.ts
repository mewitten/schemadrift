import { compareSchemas, SchemaChange } from './comparator';
import { JSONSchema7 } from 'json-schema';

describe('compareSchemas', () => {
  it('returns no changes for identical schemas', () => {
    const schema: JSONSchema7 = { type: 'object', properties: { id: { type: 'string' } } };
    expect(compareSchemas(schema, schema)).toHaveLength(0);
  });

  it('detects breaking type change', () => {
    const oldSchema: JSONSchema7 = { type: 'string' };
    const newSchema: JSONSchema7 = { type: 'number' };
    const changes = compareSchemas(oldSchema, newSchema);
    expect(changes).toHaveLength(1);
    expect(changes[0].type).toBe('breaking');
    expect(changes[0].message).toContain('Type changed');
  });

  it('detects breaking change when required field is added', () => {
    const oldSchema: JSONSchema7 = { type: 'object', required: ['id'] };
    const newSchema: JSONSchema7 = { type: 'object', required: ['id', 'email'] };
    const changes = compareSchemas(oldSchema, newSchema);
    const breaking = changes.filter((c) => c.type === 'breaking');
    expect(breaking).toHaveLength(1);
    expect(breaking[0].message).toContain("'email'");
  });

  it('detects non-breaking change when required field is removed', () => {
    const oldSchema: JSONSchema7 = { type: 'object', required: ['id', 'email'] };
    const newSchema: JSONSchema7 = { type: 'object', required: ['id'] };
    const changes = compareSchemas(oldSchema, newSchema);
    const nonBreaking = changes.filter((c) => c.type === 'non-breaking');
    expect(nonBreaking).toHaveLength(1);
    expect(nonBreaking[0].message).toContain("'email'");
  });

  it('detects breaking change when property is removed', () => {
    const oldSchema: JSONSchema7 = { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } };
    const newSchema: JSONSchema7 = { type: 'object', properties: { id: { type: 'string' } } };
    const changes = compareSchemas(oldSchema, newSchema);
    expect(changes.some((c) => c.type === 'breaking' && c.message.includes("'name'"))).toBe(true);
  });

  it('detects non-breaking change when property is added', () => {
    const oldSchema: JSONSchema7 = { type: 'object', properties: { id: { type: 'string' } } };
    const newSchema: JSONSchema7 = { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } };
    const changes = compareSchemas(oldSchema, newSchema);
    expect(changes.some((c) => c.type === 'non-breaking' && c.message.includes("'name'"))).toBe(true);
  });

  it('recurses into nested properties', () => {
    const oldSchema: JSONSchema7 = { type: 'object', properties: { address: { type: 'object', properties: { zip: { type: 'string' } } } } };
    const newSchema: JSONSchema7 = { type: 'object', properties: { address: { type: 'object', properties: { zip: { type: 'number' } } } } };
    const changes = compareSchemas(oldSchema, newSchema);
    expect(changes.some((c) => c.path.includes('address') && c.type === 'breaking')).toBe(true);
  });
});
