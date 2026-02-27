"""
Operation: Compress PDF
Reduces file size by removing redundant streams and applying deflate compression.
"""

import os
from .shared import fitz, HAVE_FITZ


def compress_pdf(pdf_path, output_folder, unique_id):
    """
    Compress a PDF by removing redundant content and applying stream compression.

    Requires:  PyMuPDF (fitz)
    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the compressed PDF file
    """
    if not HAVE_FITZ:
        raise Exception(
            "PyMuPDF (fitz) is not installed. "
            "Install it with:  python -m pip install PyMuPDF"
        )

    try:
        output_path = os.path.join(output_folder, f"{unique_id}_compressed.pdf")

        doc = fitz.open(pdf_path)
        # garbage=4  →  remove all unreferenced objects
        # deflate=True  →  recompress streams
        doc.save(output_path, deflate=True, garbage=4)
        doc.close()

        return output_path

    except Exception as e:
        raise Exception(f"PDF compression failed: {str(e)}")
