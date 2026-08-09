from fpdf import FPDF
from pathlib import Path

source = Path(__file__).resolve().parents[1] / 'BWGA_AI_OS_SYSTEM_MANUAL.md'
output = Path(__file__).resolve().parents[1] / 'BWGA_AI_OS_SYSTEM_MANUAL.pdf'
text = source.read_text(encoding='utf-8')
normalized = text.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
normalized = normalized.replace('—', ' - ').replace('–', ' - ').replace('…', '...')
normalized = normalized.replace('•', '-').replace('·', '-')
normalized = normalized.encode('ascii', 'replace').decode('ascii')

pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()
pdf.set_font('Arial', size=12)

for line in normalized.splitlines():
    if line.startswith('# '):
        pdf.set_font('Arial', 'B', 18)
        pdf.multi_cell(0, 8, line[2:].strip())
        pdf.ln(2)
        pdf.set_font('Arial', size=12)
    elif line.startswith('## '):
        pdf.set_font('Arial', 'B', 16)
        pdf.multi_cell(0, 7, line[3:].strip())
        pdf.ln(1)
        pdf.set_font('Arial', size=12)
    elif line.startswith('### '):
        pdf.set_font('Arial', 'B', 14)
        pdf.multi_cell(0, 7, line[4:].strip())
        pdf.set_font('Arial', size=12)
    elif line.startswith('---'):
        pdf.ln(1)
    elif line.strip() == '':
        pdf.ln(2)
    else:
        pdf.multi_cell(0, 6, line)

pdf.output(str(output))
print(f'PDF generated: {output}')
