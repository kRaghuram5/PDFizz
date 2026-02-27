"""
Operation: Remove Pages
Removes one or more pages from a PDF by page number.
"""

import os
import PyPDF2


def remove_pages(pdf_path, output_folder, unique_id, pages_to_remove):
    """
    Remove specific pages from a PDF document.

    Requires:  PyPDF2
    Args:
        pdf_path:        Path to the input PDF file
        output_folder:   Directory where the output file will be saved
        unique_id:       Unique identifier used to name the output file
        pages_to_remove: List of 1-based page numbers to remove
    Returns:
        Path to the resulting PDF file (with those pages deleted)
    """
    try:
        output_path    = os.path.join(output_folder, f"{unique_id}_removed.pdf")
        remove_indices = set(int(p) - 1 for p in pages_to_remove)   # convert to 0-based

        reader = PyPDF2.PdfReader(pdf_path)
        writer = PyPDF2.PdfWriter()

        for idx, page in enumerate(reader.pages):
            if idx not in remove_indices:
                writer.add_page(page)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return output_path

    except Exception as e:
        raise Exception(f"Removing pages failed: {str(e)}")
