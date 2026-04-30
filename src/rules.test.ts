import {
  requiredFieldRemovedRule,
  typeChangedRule,
  propertyRemovedRule,
  enumValueRemovedRule,
  defaultRules,
} from './rules';

describe('requiredFieldRemovedRule', () => {
  it('returns violation when required field is removed', () => {
    const violations = requiredFieldRemovedRule(
      { required: ['id', 'name'] },
      { required: ['id'] }
    );
    expect(violations).toHaveLength(1);
    expect(violations[0].rule).toBe('required-field-removed');
    expect(violations[0].message).toContain('name');
  });

  it('returns no violations when required fields are unchanged', () => {
    const violations = requiredFieldRemovedRule(
      { required: ['id'] },
      { required: ['id'] }
    );
    expect(violations).toHaveLength(0);
  });

  it('returns no violations when old schema has no required', () => {
    const violations = requiredFieldRemovedRule({}, { required: ['id'] });
    expect(violations).toHaveLength(0);
  });
});

describe('typeChangedRule', () => {
  it('returns violation when type changes', () => {
    const violations = typeChangedRule({ type: 'string' }, { type: 'number' });
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe('error');
    expect(violations[0].message).toContain('string');
    expect(violations[0].message).toContain('number');
  });

  it('returns no violations when type is unchanged', () => {
    const violations = typeChangedRule({ type: 'string' }, { type: 'string' });
    expect(violations).toHaveLength(0);
  });

  it('returns no violations when type is absent in either schema', () => {
    expect(typeChangedRule({}, { type: 'string' })).toHaveLength(0);
    expect(typeChangedRule({ type: 'string' }, {})).toHaveLength(0);
  });
});

describe('propertyRemovedRule', () => {
  it('detects removed properties', () => {
    const violations = propertyRemovedRule(
      { properties: { id: { type: 'string' }, name: { type: 'string' } } },
      { properties: { id: { type: 'string' } } }
    );
    expect(violations).toHaveLength(1);
    expect(violations[0].path).toContain('name');
  });

  it('returns no violations when all properties are present', () => {
    const violations = propertyRemovedRule(
      { properties: { id: {} } },
      { properties: { id: {}, extra: {} } }
    );
    expect(violations).toHaveLength(0);
  });
});

describe('enumValueRemovedRule', () => {
  it('detects removed enum values', () => {
    const violations = enumValueRemovedRule(
      { enum: ['a', 'b', 'c'] },
      { enum: ['a', 'b'] }
    );
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('"c"');
  });

  it('returns no violations when enum is unchanged', () => {
    expect(enumValueRemovedRule({ enum: ['x'] }, { enum: ['x'] })).toHaveLength(0);
  });
});

describe('defaultRules', () => {
  it('exports four rules', () => {
    expect(defaultRules).toHaveLength(4);
  });
});
