"""
Operation: Add Page Numbers
Stamps a page number on every page of a PDF.

Supported positions:
    header-left   header-center   header-right
    footer-left   footer-center   footer-right
"""

import os
from .shared import fitz, HAVE_FITZ


def add_page_numbers(pdf_path, output_folder, unique_id,
                     position='footer-center',
                     font_size=10):
    """
    Add page numbers to every page of a PDF.

    Requires:  PyMuPDF (fitz)
    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
        position:      Placement string: header/footer  ×  left/center/right
        font_size:     Font size in points
    Returns:
        Path to the numbered PDF file
    """
    if not HAVE_FITZ:
        raise Exception(
            "PyMuPDF (fitz) is not installed. "
            "Install it with:  pip install PyMuPDF"
        )

    try:
        output_path = os.path.join(output_folder, f"{unique_id}_numbered.pdf")
        font_size   = int(font_size)
        parts       = position.split('-', 1)
        section     = parts[0]                           # header / footer
        align_str   = parts[1] if len(parts) > 1 else 'center'  # left / center / right
        margin      = 18

        pdf_doc = fitz.open(pdf_path)
        for page_num in range(len(pdf_doc)):
            page    = pdf_doc[page_num]
            pw, ph  = page.rect.width, page.rect.height
            text    = str(page_num + 1)

            # Horizontal position
            if align_str == 'left':
                x = margin
            elif align_str == 'right':
                x = pw - margin
            else:
                x = pw / 2

            # Vertical position (insert_text baseline)
            y = margin + font_size if section == 'header' else ph - margin

            page.insert_text(
                fitz.Point(x, y),
                text,
                fontsize=font_size,
                color=(0, 0, 0),
            )

        pdf_doc.save(output_path)
        pdf_doc.close()
        return output_path

    except Exception as e:
        raise Exception(f"Adding page numbers failed: {str(e)}")
