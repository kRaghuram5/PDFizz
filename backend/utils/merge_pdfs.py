"""
Operation: Merge PDFs
Combines two or more PDF files into a single document.
"""

import os
import PyPDF2


def merge_pdfs(pdf_paths, output_folder, unique_id):
    """
    Merge multiple PDF files into one PDF.

    Requires:  PyPDF2
    Args:
        pdf_paths:     List of paths to input PDF files (in merge order)
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the merged PDF file
    """
    try:
        output_path = os.path.join(output_folder, f"{unique_id}_merged.pdf")

        writer = PyPDF2.PdfWriter()
        for pdf_path in pdf_paths:
            reader = PyPDF2.PdfReader(pdf_path)
            for page in reader.pages:
                writer.add_page(page)

        with open(output_path, 'wb') as f:
            writer.write(f)

        return output_path

    except Exception as e:
        raise Exception(f"PDF merging failed: {str(e)}")
