# How to Generate PDF from Research Paper V4.0

There are multiple ways to convert the ADVERSIQ Research Paper V4.0 from Markdown to PDF. Choose the method that works best for you.

---

## 📄 Source File

**Input:** `ADVERSIQ_RESEARCH_PAPER_V4.0.md`  
**Output:** `ADVERSIQ_RESEARCH_PAPER_V4.0.pdf`

---

## Method 1: Online Converter (Easiest - No Installation)

### Option A: Markdown to PDF (Free)
1. Go to: https://www.markdowntopdf.com/
2. Click "Choose File" and select `ADVERSIQ_RESEARCH_PAPER_V4.0.md`
3. Click "Convert"
4. Download the generated PDF

### Option B: Dillinger (Free)
1. Go to: https://dillinger.io/
2. Click "Import from" → "Choose File"
3. Select `ADVERSIQ_RESEARCH_PAPER_V4.0.md`
4. Click "Export as" → "PDF"
5. Download the PDF

### Option C: StackEdit (Free)
1. Go to: https://stackedit.io/
2. Click "Import from disk"
3. Select `ADVERSIQ_RESEARCH_PAPER_V4.0.md`
4. Click menu (☰) → "Export to disk" → "PDF"
5. Download the PDF

---

## Method 2: VS Code Extension (Recommended for Developers)

### Step 1: Install Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Markdown PDF"
4. Install "Markdown PDF" by yzane
5. Restart VS Code

### Step 2: Generate PDF
1. Open `ADVERSIQ_RESEARCH_PAPER_V4.0.md` in VS Code
2. Right-click in the editor
3. Select "Markdown PDF: Export (pdf)"
4. PDF will be generated in the same folder

**Settings (Optional):**
```json
{
  "markdown-pdf.format": "A4",
  "markdown-pdf.displayHeaderFooter": true,
  "markdown-pdf.headerTemplate": "<div style='font-size: 9px; margin-left: 1cm;'>ADVERSIQ Research Paper V4.0</div>",
  "markdown-pdf.footerTemplate": "<div style='font-size: 9px; margin: 0 auto;'><span class='pageNumber'></span> / <span class='totalPages'></span></div>"
}
```

---

## Method 3: Pandoc (Professional Quality)

### Step 1: Install Pandoc
**Windows:**
```powershell
# Using Chocolatey
choco install pandoc

# Or download from: https://pandoc.org/installing.html
```

**Mac:**
```bash
brew install pandoc
```

**Linux:**
```bash
sudo apt-get install pandoc
```

### Step 2: Install LaTeX (for PDF generation)
**Windows:**
- Download MiKTeX: https://miktex.org/download

**Mac:**
```bash
brew install --cask mactex
```

**Linux:**
```bash
sudo apt-get install texlive-full
```

### Step 3: Generate PDF
```bash
cd C:/Users/brayd/Desktop/ADVERSIQ-Intelligence/ADVERSIQ-Intelligence-main

pandoc ADVERSIQ_RESEARCH_PAPER_V4.0.md -o ADVERSIQ_RESEARCH_PAPER_V4.0.pdf \
  --pdf-engine=xelatex \
  --variable geometry:margin=1in \
  --variable fontsize=11pt \
  --variable documentclass=article \
  --toc \
  --number-sections
```

**With Custom Styling:**
```bash
pandoc ADVERSIQ_RESEARCH_PAPER_V4.0.md -o ADVERSIQ_RESEARCH_PAPER_V4.0.pdf \
  --pdf-engine=xelatex \
  --variable geometry:margin=1in \
  --variable fontsize=11pt \
  --variable documentclass=article \
  --variable colorlinks=true \
  --variable linkcolor=blue \
  --variable urlcolor=blue \
  --toc \
  --number-sections \
  --highlight-style=tango
```

---

## Method 4: Node.js Script (Automated)

### Step 1: Install Dependencies
```bash
cd C:/Users/brayd/Desktop/ADVERSIQ-Intelligence/ADVERSIQ-Intelligence-main
npm install markdown-pdf
```

### Step 2: Run Script
```bash
node generate-pdf.js
```

The script will:
- ✅ Check dependencies
- ✅ Generate PDF with proper formatting
- ✅ Show file size and location
- ✅ Confirm completion

---

## Method 5: Python Script (Alternative)

### Step 1: Install Dependencies
```bash
pip install markdown2 pdfkit
```

**Windows:** Also install wkhtmltopdf from https://wkhtmltopdf.org/downloads.html

### Step 2: Create Script
Create `generate_pdf.py`:
```python
import markdown2
import pdfkit

# Read markdown
with open('ADVERSIQ_RESEARCH_PAPER_V4.0.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert to HTML
html_content = markdown2.markdown(md_content, extras=['tables', 'fenced-code-blocks'])

# Add CSS styling
styled_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 2cm; }}
        h1 {{ color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }}
        h2 {{ color: #34495e; border-bottom: 2px solid #95a5a6; padding-bottom: 8px; }}
        h3 {{ color: #7f8c8d; }}
        code {{ background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }}
        pre {{ background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }}
        table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
        th {{ background-color: #3498db; color: white; }}
        tr:nth-child(even) {{ background-color: #f2f2f2; }}
    </style>
</head>
<body>
{html_content}
</body>
</html>
"""

# Generate PDF
pdfkit.from_string(styled_html, 'ADVERSIQ_RESEARCH_PAPER_V4.0.pdf')
print("✅ PDF generated successfully!")
```

### Step 3: Run Script
```bash
python generate_pdf.py
```

---

## Method 6: Microsoft Word (Manual)

### Step 1: Open in Word
1. Open Microsoft Word
2. File → Open
3. Select `ADVERSIQ_RESEARCH_PAPER_V4.0.md`
4. Word will convert markdown to formatted document

### Step 2: Format (Optional)
- Apply heading styles
- Adjust fonts and spacing
- Add page numbers
- Insert table of contents

### Step 3: Export to PDF
1. File → Save As
2. Choose "PDF" as file type
3. Save as `ADVERSIQ_RESEARCH_PAPER_V4.0.pdf`

---

## Method 7: Google Docs (Cloud-Based)

### Step 1: Upload to Google Drive
1. Go to https://drive.google.com
2. Click "New" → "File upload"
3. Select `ADVERSIQ_RESEARCH_PAPER_V4.0.md`

### Step 2: Open with Google Docs
1. Right-click the uploaded file
2. Select "Open with" → "Google Docs"
3. Document will be converted

### Step 3: Export to PDF
1. File → Download → PDF Document (.pdf)
2. Save as `ADVERSIQ_RESEARCH_PAPER_V4.0.pdf`

---

## Recommended Method by Use Case

| Use Case | Recommended Method | Why |
|----------|-------------------|-----|
| **Quick & Easy** | Online Converter (Method 1) | No installation required |
| **Best Quality** | Pandoc (Method 3) | Professional typesetting |
| **For Developers** | VS Code Extension (Method 2) | Integrated workflow |
| **Automated** | Node.js Script (Method 4) | One-click generation |
| **No Technical Skills** | Microsoft Word (Method 6) | Familiar interface |
| **Cloud-Based** | Google Docs (Method 7) | Access anywhere |

---

## PDF Specifications

**Recommended Settings:**
- **Paper Size:** A4 (210mm × 297mm)
- **Margins:** 2cm all sides
- **Font:** Arial or Times New Roman, 11pt
- **Line Spacing:** 1.5
- **Page Numbers:** Bottom center
- **Header:** "ADVERSIQ Research Paper V4.0"
- **Table of Contents:** Yes (auto-generated)

**Expected Output:**
- **Pages:** ~35-40 pages
- **File Size:** 1-3 MB
- **Format:** PDF/A (archival quality)

---

## Troubleshooting

### Issue: "Command not found"
**Solution:** Install the required tool (Pandoc, Node.js, Python)

### Issue: "Permission denied"
**Solution:** Run command prompt as Administrator

### Issue: "Module not found"
**Solution:** Install dependencies with npm or pip

### Issue: "PDF looks wrong"
**Solution:** Try a different method or adjust settings

### Issue: "File too large"
**Solution:** Use Pandoc with compression:
```bash
pandoc ADVERSIQ_RESEARCH_PAPER_V4.0.md -o ADVERSIQ_RESEARCH_PAPER_V4.0.pdf --pdf-engine=xelatex
```

---

## Quick Start (Fastest Method)

**For Non-Technical Users:**
1. Go to https://www.markdowntopdf.com/
2. Upload `ADVERSIQ_RESEARCH_PAPER_V4.0.md`
3. Click "Convert"
4. Download PDF
5. Done! ✅

**For Developers:**
1. Install VS Code extension "Markdown PDF"
2. Open `ADVERSIQ_RESEARCH_PAPER_V4.0.md`
3. Right-click → "Markdown PDF: Export (pdf)"
4. Done! ✅

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Try an alternative method
3. Contact: brayden@adversiq.xyz

---

**The research paper is ready. Choose your preferred method and generate the PDF!**