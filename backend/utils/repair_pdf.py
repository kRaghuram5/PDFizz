"""
Operation: Repair PDF
Attempts to recover a damaged or corrupt PDF by re-reading and re-writing
all retrievable pages.  Falls back to PyMuPDF if PyPDF2 fails entirely.
"""

import os
import PyPDF2
from .shared import fitz, HAVE_FITZ


def repair_pdf(pdf_path, output_folder, unique_id):
    """
    Try to repair a damaged PDF by copying all readable pages into a new file.

    Requires:  PyPDF2  (+ PyMuPDF as fallback)
    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the repaired PDF file
    """
    try:
        output_path = os.path.join(output_folder, f"{unique_id}_repaired.pdf")

        # ── Method 1: PyPDF2 (skips individual broken pages) ─────────────────
        try:
            reader = PyPDF2.PdfReader(pdf_path)
            writer = PyPDF2.PdfWriter()

            for page_num in range(len(reader.pages)):
                try:
                    writer.add_page(reader.pages[page_num])
                except Exception:
                    pass   # skip unreadable pages

            with open(output_path, 'wb') as f:
                writer.write(f)

            return output_path

        except Exception:
            pass   # fall through to PyMuPDF

        # ── Method 2: PyMuPDF ────────────────────────────────────────────────
        if not HAVE_FITZ:
            raise Exception("Could not repair PDF: no suitable library available.")

        doc = fitz.open(pdf_path)
        doc.save(output_path)
        doc.close()
        return output_path

    except Exception as e:
        raise Exception(f"PDF repair failed: {str(e)}")
