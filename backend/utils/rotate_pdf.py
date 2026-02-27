"""
Operation: Rotate PDF
Rotates all pages in a PDF by any angle.
Uses PyMuPDF for arbitrary angles; falls back to PyPDF2 for multiples of 90°.
"""

import os
import math
import PyPDF2
from .shared import fitz, HAVE_FITZ


def rotate_pdf(pdf_path, output_folder, unique_id, rotation):
    """
    Rotate every page in a PDF by the given angle (degrees).

    Requires:  PyMuPDF (fitz) for arbitrary angles  /  PyPDF2 as fallback (90° steps)
    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
        rotation:      Rotation angle in degrees (e.g. 90, 180, 270, or any value)
    Returns:
        Path to the rotated PDF file
    """
    try:
        angle       = int(rotation) % 360
        output_path = os.path.join(output_folder, f"{unique_id}_rotated.pdf")

        if HAVE_FITZ:
            # PyMuPDF supports any angle
            doc     = fitz.open(pdf_path)
            new_doc = fitz.open()

            for page_num in range(len(doc)):
                page   = doc[page_num]
                w, h   = page.rect.width, page.rect.height

                if angle in (90, 270):
                    new_w, new_h = h, w
                elif angle in (0, 180):
                    new_w, new_h = w, h
                else:
                    rad    = math.radians(angle)
                    new_w  = abs(w * math.cos(rad)) + abs(h * math.sin(rad))
                    new_h  = abs(w * math.sin(rad)) + abs(h * math.cos(rad))

                new_page = new_doc.new_page(width=new_w, height=new_h)
                new_page.show_pdf_page(new_page.rect, doc, page_num, rotate=angle)

            new_doc.save(output_path)
            new_doc.close()
            doc.close()

        else:
            # Fallback: PyPDF2 only handles multiples of 90°
            snap   = round(angle / 90) * 90 % 360
            reader = PyPDF2.PdfReader(pdf_path)
            writer = PyPDF2.PdfWriter()
            for page in reader.pages:
                page.rotate(snap)
                writer.add_page(page)
            with open(output_path, 'wb') as f:
                writer.write(f)

        return output_path

    except Exception as e:
        raise Exception(f"PDF rotation failed: {str(e)}")
