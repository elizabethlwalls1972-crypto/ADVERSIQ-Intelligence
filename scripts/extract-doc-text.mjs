import fs from 'node:fs/promises';
import path from 'node:path';

import { PDFParse } from 'pdf-parse';

const pdfPath = process.argv[2] || 'Document 209.pdf';

try {
  const absolutePath = path.resolve(process.cwd(), pdfPath);
  const buf = await fs.readFile(absolutePath);

  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  await parser.destroy();

  process.stdout.write(result.text || '');
} catch (e) {
  console.error('Failed to extract text from PDF:', pdfPath);
  console.error(e);
  process.exit(1);
}
