"""
Operation: Reverse PDF
Reverses the page order of a PDF (last page becomes first, etc.).
"""

import os
import PyPDF2


def reverse_pdf(pdf_path, output_folder, unique_id):
    """
    Reverse the page order of a PDF file.

    Requires:  PyPDF2
    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the reversed PDF file
    """
    try:
        output_path = os.path.join(output_folder, f"{unique_id}_reversed.pdf")

        reader = PyPDF2.PdfReader(pdf_path)
        writer = PyPDF2.PdfWriter()

        for page in reversed(reader.pages):
            writer.add_page(page)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return output_path

    except Exception as e:
        raise Exception(f"PDF reversal failed: {str(e)}")
