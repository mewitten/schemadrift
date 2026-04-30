import { formatReport, SchemaChange } from './reporter';

const sampleChanges: SchemaChange[] = [
  {
    type: 'breaking',
    path: '#/properties/age',
    message: 'Property type changed from number to string',
    before: 'number',
    after: 'string',
  },
  {
    type: 'non-breaking',
    path: '#/properties/nickname',
    message: 'New optional property added',
    after: { type: 'string' },
  },
  {
    type: 'info',
    path: '#/description',
    message: 'Schema description updated',
  },
];

describe('formatReport', () => {
  describe('text format', () => {
    it('returns a no-changes message when there are no changes', () => {
      const result = formatReport([]);
      expect(result).toBe('No schema changes detected.');
    });

    it('includes breaking and non-breaking changes by default', () => {
      const result = formatReport(sampleChanges);
      expect(result).toContain('[BREAKING]');
      expect(result).toContain('[NON-BREAKING]');
      expect(result).toContain('[INFO]');
    });

    it('filters out non-breaking changes when includeNonBreaking is false', () => {
      const result = formatReport(sampleChanges, { includeNonBreaking: false });
      expect(result).toContain('[BREAKING]');
      expect(result).not.toContain('[NON-BREAKING]');
    });

    it('includes before/after values in output', () => {
      const result = formatReport(sampleChanges);
      expect(result).toContain('Before: "number"');
      expect(result).toContain('After:  "string"');
    });

    it('includes a summary line with counts', () => {
      const result = formatReport(sampleChanges);
      expect(result).toContain('3 change(s), 1 breaking');
    });
  });

  describe('json format', () => {
    it('returns valid JSON', () => {
      const result = formatReport(sampleChanges, { format: 'json' });
      const parsed = JSON.parse(result);
      expect(parsed.changes).toHaveLength(3);
      expect(parsed.breakingCount).toBe(1);
    });
  });

  describe('markdown format', () => {
    it('returns a no-changes message when there are no changes', () => {
      const result = formatReport([], { format: 'markdown' });
      expect(result).toContain('No schema changes detected');
    });

    it('includes a markdown table with changes', () => {
      const result = formatReport(sampleChanges, { format: 'markdown' });
      expect(result).toContain('| Type | Path | Message |');
      expect(result).toContain('🔴 Breaking');
      expect(result).toContain('🟡 Non-Breaking');
    });

    it('shows the correct breaking count in the summary', () => {
      const result = formatReport(sampleChanges, { format: 'markdown' });
      expect(result).toContain('**1 breaking change(s)**');
    });
  });
});
