"""
Operation: PDF → Images (PNG pages, delivered as a .zip)
"""

import os
import shutil
import zipfile
from .shared import fitz, HAVE_FITZ


def pdf_to_images(pdf_path, output_folder, unique_id):
    """
    Convert every page of a PDF to a PNG image and bundle them in a ZIP.

    Requires:  PyMuPDF (fitz)
    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the generated .zip file containing all page images
    """
    if not HAVE_FITZ:
        raise Exception(
            "PyMuPDF (fitz) is not installed. "
            "Install it with:  python -m pip install PyMuPDF"
        )

    try:
        temp_dir = os.path.join(output_folder, f"{unique_id}_images")
        os.makedirs(temp_dir, exist_ok=True)

        doc = fitz.open(pdf_path)
        for page_num, page in enumerate(doc, start=1):
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))   # 2× zoom = better quality
            pix.save(os.path.join(temp_dir, f"page_{page_num}.png"))
        doc.close()

        # Bundle all PNGs into one ZIP
        zip_path = os.path.join(output_folder, f"{unique_id}_images.zip")
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for root, _, files in os.walk(temp_dir):
                for f in files:
                    zf.write(os.path.join(root, f), arcname=f)

        shutil.rmtree(temp_dir)
        return zip_path

    except Exception as e:
        raise Exception(f"PDF to Images conversion failed: {str(e)}")
