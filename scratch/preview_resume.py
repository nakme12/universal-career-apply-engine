import pypdf
import os
from pdf2image import convert_from_path

pdf_path = r'C:\mcp\universal-career-apply-engine\data\canonical_resumes\Pratik_Patidar_Resume_Frontend_Engineer.pdf'

reader = pypdf.PdfReader(pdf_path)
print("Page count:", len(reader.pages))
for i, page in enumerate(reader.pages):
    print(f"Page {i+1} size: {page.mediabox.width} x {page.mediabox.height}")

try:
    images = convert_from_path(pdf_path)
    out_png = r'C:\mcp\universal-career-apply-engine\scratch\fe_preview.png'
    images[0].save(out_png, 'PNG')
    print("Saved preview PNG to", out_png)
except Exception as e:
    print("pdf2image error:", e)
