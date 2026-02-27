"""
Operation: Plain Text (.txt) → PDF
Converts a text file to a PDF using ReportLab, with automatic line wrapping
and page breaks.
"""

import os
from .shared import canvas, letter, HAVE_REPORTLAB


def text_to_pdf(text_path, output_folder, unique_id):
    """
    Convert a plain-text file to a PDF.

    Requires:  reportlab
    Args:
        text_path:     Path to the input .txt file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the generated PDF file
    """
    if not HAVE_REPORTLAB:
        raise Exception(
            "reportlab is not installed. "
            "Install it with:  python -m pip install reportlab"
        )

    try:
        output_path   = os.path.join(output_folder, f"{unique_id}_output.pdf")
        c             = canvas.Canvas(output_path, pagesize=letter)
        width, height = letter
        y             = height - 50
        line_height   = 15

        with open(text_path, 'r', encoding='utf-8') as f:
            for raw_line in f:
                line = raw_line.rstrip('\n')

                if y < 50:
                    c.showPage()
                    y = height - 50

                if len(line) > 80:
                    # Wrap long lines at 80 characters
                    words        = line.split()
                    current_line = ""
                    for word in words:
                        test = f"{current_line} {word}".strip()
                        if len(test) <= 80:
                            current_line = test
                        else:
                            c.drawString(50, y, current_line)
                            y -= line_height
                            current_line = word
                            if y < 50:
                                c.showPage()
                                y = height - 50
                    if current_line:
                        c.drawString(50, y, current_line)
                        y -= line_height
                else:
                    c.drawString(50, y, line)
                    y -= line_height

        c.save()
        return output_path

    except Exception as e:
        raise Exception(f"Text to PDF conversion failed: {str(e)}")
