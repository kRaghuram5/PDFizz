"""
Operation: Extract Images from PDF
Extracts every embedded image from a PDF and delivers them in a .zip archive.
"""

import os
import shutil
import zipfile
from .shared import fitz, HAVE_FITZ


def extract_images_from_pdf(pdf_path, output_folder, unique_id):
    """
    Extract all images embedded in a PDF and bundle them into a ZIP file.

    Requires:  PyMuPDF (fitz)
    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the ZIP file containing all extracted images
    Raises:
        Exception if no images are found or extraction fails
    """
    if not HAVE_FITZ:
        raise Exception(
            "PyMuPDF (fitz) is not installed. "
            "Install it with:  python -m pip install PyMuPDF"
        )

    try:
        temp_dir = os.path.join(output_folder, f"{unique_id}_temp_images")
        os.makedirs(temp_dir, exist_ok=True)

        doc         = fitz.open(pdf_path)
        image_count = 0

        for page_number, page in enumerate(doc, start=1):
            for img_index, img in enumerate(page.get_images(full=True), start=1):
                xref       = img[0]
                base_image = doc.extract_image(xref)
                ext        = base_image["ext"]
                filename   = f"page_{page_number}_image_{img_index}.{ext}"

                with open(os.path.join(temp_dir, filename), "wb") as f:
                    f.write(base_image["image"])

                image_count += 1

        doc.close()

        if image_count == 0:
            shutil.rmtree(temp_dir)
            raise Exception("No images found in the PDF file.")

        # Bundle into ZIP
        zip_path = os.path.join(output_folder, f"{unique_id}_extracted_images.zip")
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for root, _, files in os.walk(temp_dir):
                for f in files:
                    fp = os.path.join(root, f)
                    zf.write(fp, arcname=os.path.relpath(fp, temp_dir))

        shutil.rmtree(temp_dir)
        print(f"Extracted {image_count} images → {zip_path}")
        return zip_path

    except Exception as e:
        raise Exception(f"Image extraction failed: {str(e)}")
