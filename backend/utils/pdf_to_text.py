"""
Operation: PDF → Plain Text (.txt)
"""

import os
import PyPDF2


def pdf_to_text(pdf_path, output_folder, unique_id):
    """
    Extract all text from a PDF and save it as a .txt file.

    Requires:  PyPDF2
    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the generated .txt file
    """
    try:
        output_path = os.path.join(output_folder, f"{unique_id}_output.txt")

        with open(pdf_path, 'rb') as pdf_file:
            reader = PyPDF2.PdfReader(pdf_file)
            with open(output_path, 'w', encoding='utf-8') as out_file:
                for page in reader.pages:
                    text = page.extract_text()
                    out_file.write(text)
                    out_file.write('\n' + '=' * 80 + '\n')

        return output_path

    except Exception as e:
        raise Exception(f"PDF to Text conversion failed: {str(e)}")
