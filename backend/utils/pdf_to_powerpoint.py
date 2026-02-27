"""
Operation: PDF → PowerPoint (.pptx)
Each PDF page becomes a full-slide image inside the presentation.
"""

import os
from .shared import fitz, HAVE_FITZ, Presentation, HAVE_PPTX


def pdf_to_powerpoint(pdf_path, output_folder, unique_id):
    """
    Convert each page of a PDF into a slide in a PowerPoint presentation.

    Requires:  PyMuPDF (fitz), python-pptx
    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the generated .pptx file
    """
    if not HAVE_PPTX:
        raise Exception(
            "python-pptx is not installed. "
            "Install it with:  pip install python-pptx"
        )
    if not HAVE_FITZ:
        raise Exception(
            "PyMuPDF (fitz) is not installed. "
            "Install it with:  pip install PyMuPDF"
        )

    try:
        output_path = os.path.join(output_folder, f"{unique_id}_converted.pptx")

        pdf_doc = fitz.open(pdf_path)
        presentation = Presentation()

        # Standard 10 × 7.5 inch slide (EMU units)
        presentation.slide_width  = int(10  * 914400)
        presentation.slide_height = int(7.5 * 914400)

        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            pix  = page.get_pixmap(matrix=fitz.Matrix(2, 2))   # high quality

            # Save temp image then embed in slide
            img_path = os.path.join(output_folder, f"_tmp_page_{page_num}.png")
            pix.save(img_path)

            slide = presentation.slides.add_slide(presentation.slide_layouts[6])  # blank
            slide.shapes.add_picture(
                img_path, 0, 0,
                width=presentation.slide_width,
                height=presentation.slide_height
            )
            os.remove(img_path)

        presentation.save(output_path)
        pdf_doc.close()
        return output_path

    except Exception as e:
        raise Exception(f"PDF to PowerPoint conversion failed: {str(e)}")
