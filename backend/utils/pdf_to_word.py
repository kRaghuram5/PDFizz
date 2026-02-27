"""
Operation: PDF → Word (.docx)
"""

import os
from .shared import Converter, HAVE_PDF2DOCX


def pdf_to_word(pdf_path, output_folder, unique_id):
    """
    Convert a PDF file to a Word document (.docx).

    Requires:  pdf2docx
    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the generated .docx file
    """
    if not HAVE_PDF2DOCX:
        raise Exception(
            "pdf2docx is not installed. "
            "Install it with:  python -m pip install pdf2docx"
        )

    try:
        output_path = os.path.join(output_folder, f"{unique_id}_output.docx")

        converter = Converter(pdf_path)
        converter.convert(output_path, start=0, end=None)
        converter.close()

        return output_path

    except AttributeError as e:
        if "'Rect' object has no attribute 'get_area'" in str(e):
            raise Exception(
                "PDF to Word conversion is unavailable due to a compatibility issue "
                "between pdf2docx (0.5.8) and PyMuPDF (1.26+). "
                "Tip: Use 'PDF to Text' first, then paste into Word."
            )
        raise Exception(f"PDF to Word conversion failed: {str(e)}")
    except Exception as e:
        raise Exception(f"PDF to Word conversion failed: {str(e)}")
