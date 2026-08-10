
export type DocType = 'report' | 'memo' | 'brief' | 'analysis' | 'unknown';
export class DocumentTypeRouter {
  route(text: string): DocType {
    const t = text.toLowerCase();
    if (t.includes('executive summary') || t.includes('findings')) return 'report';
    if (t.includes('recommend') && t.includes('option')) return 'brief';
    if (t.includes('analysis of')) return 'analysis';
    if (t.includes('memo') || t.includes('note to')) return 'memo';
    return 'unknown';
  }
  template(type: DocType): string { return 'template:' + type; }
}
export default DocumentTypeRouter;
