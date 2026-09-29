import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted, Table, TableStyle
from reportlab.pdfgen import canvas

BASE_DIR = r"C:\Users\NALIN SHEKHAR\.gemini\antigravity\scratch\tc-red-flag-scanner"
OUTPUT_DIR = os.path.join(BASE_DIR, "pdf_exports")
os.makedirs(OUTPUT_DIR, exist_ok=True)

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header
        self.drawString(36, 762, "T&C RED FLAG SCANNER — Source Code Documentation | Team CorruptX")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(36, 754, 576, 754)
        
        # Footer
        self.line(36, 45, 576, 45)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 32, page_text)
        self.drawString(36, 32, "Confidential & Proprietary — Hackathon Submission")
        self.restoreState()

def create_pdf(pdf_filename, title, file_list):
    pdf_path = os.path.join(OUTPUT_DIR, pdf_filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )

    file_header_style = ParagraphStyle(
        'FileHeader',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=10,
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0f172a")
    )

    story = []
    
    # Cover Header
    story.append(Paragraph(title, title_style))
    story.append(Paragraph("Project: T&C Red Flag Scanner | Team: CorruptX", subtitle_style))
    story.append(Spacer(1, 10))

    for idx, rel_path in enumerate(file_list):
        full_path = os.path.join(BASE_DIR, rel_path)
        if not os.path.exists(full_path):
            continue

        if idx > 0:
            story.append(PageBreak())

        # File Title Box
        file_box_data = [[
            Paragraph(f"<b>File:</b> {rel_path}", ParagraphStyle('BoxText', fontName='Helvetica-Bold', fontSize=11, textColor=colors.HexColor("#0284c7"))),
            Paragraph(f"<b>Size:</b> {os.path.getsize(full_path)} bytes", ParagraphStyle('BoxTextR', fontName='Helvetica', fontSize=9, alignment=2, textColor=colors.HexColor("#64748b")))
        ]]
        t = Table(file_box_data, colWidths=[380, 160])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0f9ff")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#bae6fd")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(t)
        story.append(Spacer(1, 10))

        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            content = f"Error reading file: {e}"

        # Format lines with line numbers
        lines = content.splitlines()
        formatted_lines = []
        for i, line in enumerate(lines, 1):
            # Escape XML special chars for ReportLab
            clean_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            # Tab replacement
            clean_line = clean_line.replace('\t', '    ')
            formatted_lines.append(f"{i:4d} | {clean_line}")

        formatted_code = "\n".join(formatted_lines)
        
        # Split code into smaller chunks (~35 lines) so ReportLab breaks them cleanly across pages
        max_lines_per_chunk = 35
        code_chunks = [lines[i:i + max_lines_per_chunk] for i in range(0, len(lines), max_lines_per_chunk)]
        
        for chunk_idx, chunk in enumerate(code_chunks):
            start_line = chunk_idx * max_lines_per_chunk + 1
            chunk_formatted = []
            for i, line in enumerate(chunk, start_line):
                clean_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\t', '    ')
                chunk_formatted.append(f"{i:4d} | {clean_line}")
            
            chunk_text = "\n".join(chunk_formatted)
            pre = Preformatted(chunk_text, code_style)
            story.append(pre)
            story.append(Spacer(1, 4))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {pdf_filename}")

# File groups
groups = {
    "1_Backend_Python_Code.pdf": (
        "Backend Python Source Code",
        [
            "backend/app.py",
            "backend/analyzer.py",
            "backend/test_server.py",
            "backend/test_analyzer.py",
            "backend/test_client_js.py",
            "backend/test_chatbot_and_storage.py"
        ]
    ),
    "2_Frontend_HTML_Pages.pdf": (
        "Frontend HTML Web Pages",
        [
            "frontend/index.html",
            "frontend/scanner.html",
            "frontend/results.html",
            "frontend/history.html",
            "frontend/about.html"
        ]
    ),
    "3_Frontend_JS_Scripts.pdf": (
        "Frontend JavaScript Logic & Engines",
        [
            "frontend/js/chatbot.js",
            "frontend/js/client_analyzer.js",
            "frontend/js/rules_data.js",
            "frontend/js/app.js",
            "frontend/js/scanner.js",
            "frontend/js/results.js",
            "frontend/js/history.js",
            "frontend/js/sample_data.js"
        ]
    ),
    "4_Frontend_CSS_Styles.pdf": (
        "Frontend CSS User Interface Styles",
        [
            "frontend/css/style.css",
            "frontend/css/chatbot.css",
            "frontend/css/scanner.css",
            "frontend/css/results.css",
            "frontend/css/responsive.css"
        ]
    ),
    "5_Configuration_and_Data.pdf": (
        "Configuration, Rules Taxonomy & Documentation",
        [
            "backend/risk_rules.json",
            "backend/sample_policies.json",
            "backend/requirements.txt",
            "README.md"
        ]
    )
}

all_files = []
for title, files in groups.values():
    all_files.extend(files)

# Generate individual category PDFs
for filename, (title, files) in groups.items():
    create_pdf(filename, title, files)

# Generate COMPLETE Master PDF
create_pdf("COMPLETE_TC_RED_FLAG_SCANNER_CODEBASE.pdf", "Master Codebase Document (All Files)", all_files)
print("All PDFs successfully created in pdf_exports!")
