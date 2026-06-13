import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';

// Parse a CSV file into an array of plain objects keyed by header.
export function readCsv(filePath) {
  const text = readFileSync(filePath, 'utf8');
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
}
