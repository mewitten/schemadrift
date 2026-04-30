export type ChangeType = 'breaking' | 'non-breaking' | 'info';

export interface SchemaChange {
  type: ChangeType;
  path: string;
  message: string;
  before?: unknown;
  after?: unknown;
}

export interface ReportOptions {
  format?: 'text' | 'json' | 'markdown';
  includeNonBreaking?: boolean;
}

export function formatReport(changes: SchemaChange[], options: ReportOptions = {}): string {
  const { format = 'text', includeNonBreaking = true } = options;

  const filtered = includeNonBreaking
    ? changes
    : changes.filter((c) => c.type === 'breaking');

  if (format === 'json') {
    return JSON.stringify({ changes: filtered, breakingCount: filtered.filter(c => c.type === 'breaking').length }, null, 2);
  }

  if (format === 'markdown') {
    return formatMarkdown(filtered);
  }

  return formatText(filtered);
}

function formatText(changes: SchemaChange[]): string {
  if (changes.length === 0) {
    return 'No schema changes detected.';
  }

  const lines: string[] = ['Schema Drift Report', '==================='];

  for (const change of changes) {
    const prefix = change.type === 'breaking' ? '[BREAKING]' : change.type === 'non-breaking' ? '[NON-BREAKING]' : '[INFO]';
    lines.push(`${prefix} ${change.path}: ${change.message}`);
    if (change.before !== undefined) lines.push(`  Before: ${JSON.stringify(change.before)}`);
    if (change.after !== undefined) lines.push(`  After:  ${JSON.stringify(change.after)}`);
  }

  const breakingCount = changes.filter((c) => c.type === 'breaking').length;
  lines.push('');
  lines.push(`Total: ${changes.length} change(s), ${breakingCount} breaking.`);

  return lines.join('\n');
}

function formatMarkdown(changes: SchemaChange[]): string {
  if (changes.length === 0) {
    return '## Schema Drift Report\n\n✅ No schema changes detected.';
  }

  const lines: string[] = ['## Schema Drift Report', ''];
  const breakingCount = changes.filter((c) => c.type === 'breaking').length;

  lines.push(`> **${breakingCount} breaking change(s)** out of ${changes.length} total.`, '');
  lines.push('| Type | Path | Message |', '|------|------|---------|');

  for (const change of changes) {
    const badge = change.type === 'breaking' ? '🔴 Breaking' : change.type === 'non-breaking' ? '🟡 Non-Breaking' : 'ℹ️ Info';
    lines.push(`| ${badge} | \`${change.path}\` | ${change.message} |`);
  }

  return lines.join('\n');
}
