/**
 * Built-in rules for detecting breaking changes between JSON Schema versions.
 * Each rule receives the old and new schema and returns a list of violations.
 */

export interface RuleViolation {
  rule: string;
  severity: 'error' | 'warning';
  path: string;
  message: string;
}

export type Rule = (
  oldSchema: Record<string, unknown>,
  newSchema: Record<string, unknown>,
  path?: string
) => RuleViolation[];

export const requiredFieldRemovedRule: Rule = (old, next, path = '#') => {
  const violations: RuleViolation[] = [];
  const oldRequired: string[] = (old.required as string[]) ?? [];
  const newRequired: string[] = (next.required as string[]) ?? [];
  for (const field of oldRequired) {
    if (!newRequired.includes(field)) {
      violations.push({
        rule: 'required-field-removed',
        severity: 'error',
        path: `${path}/required`,
        message: `Required field "${field}" was removed`,
      });
    }
  }
  return violations;
};

export const typeChangedRule: Rule = (old, next, path = '#') => {
  const violations: RuleViolation[] = [];
  if (old.type !== undefined && next.type !== undefined && old.type !== next.type) {
    violations.push({
      rule: 'type-changed',
      severity: 'error',
      path: `${path}/type`,
      message: `Type changed from "${old.type}" to "${next.type}"`,
    });
  }
  return violations;
};

export const propertyRemovedRule: Rule = (old, next, path = '#') => {
  const violations: RuleViolation[] = [];
  const oldProps = (old.properties as Record<string, unknown>) ?? {};
  const newProps = (next.properties as Record<string, unknown>) ?? {};
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps)) {
      violations.push({
        rule: 'property-removed',
        severity: 'error',
        path: `${path}/properties/${key}`,
        message: `Property "${key}" was removed`,
      });
    }
  }
  return violations;
};

export const enumValueRemovedRule: Rule = (old, next, path = '#') => {
  const violations: RuleViolation[] = [];
  const oldEnum: unknown[] = (old.enum as unknown[]) ?? [];
  const newEnum: unknown[] = (next.enum as unknown[]) ?? [];
  if (oldEnum.length === 0) return violations;
  for (const value of oldEnum) {
    if (!newEnum.includes(value)) {
      violations.push({
        rule: 'enum-value-removed',
        severity: 'error',
        path: `${path}/enum`,
        message: `Enum value ${JSON.stringify(value)} was removed`,
      });
    }
  }
  return violations;
};

export const defaultRules: Rule[] = [
  requiredFieldRemovedRule,
  typeChangedRule,
  propertyRemovedRule,
  enumValueRemovedRule,
];
