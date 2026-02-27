"""
Operation: Excel (.xlsx / .xls) → PDF
Uses LibreOffice (headless) to convert a spreadsheet to PDF.
"""

import os
import subprocess
import platform


def excel_to_pdf(excel_path, output_folder, unique_id):
    """
    Convert an Excel spreadsheet to PDF using LibreOffice.

    Requires:  LibreOffice installed on the system
    Args:
        excel_path:    Path to the input .xlsx / .xls file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the generated PDF file
    """
    try:
        output_path     = os.path.join(output_folder, f"{unique_id}_converted.pdf")
        excel_abs       = os.path.abspath(excel_path)
        output_abs      = os.path.abspath(output_folder)
        libreoffice_exe = "soffice.exe" if platform.system() == "Windows" else "libreoffice"

        subprocess.run(
            [libreoffice_exe, "--headless", "--convert-to", "pdf",
             "--outdir", output_abs, excel_abs],
            check=True,
            capture_output=True,
        )

        # LibreOffice names the output after the source file
        base       = os.path.splitext(os.path.basename(excel_path))[0]
        source_pdf = os.path.join(output_abs, f"{base}.pdf")
        if os.path.exists(source_pdf):
            os.rename(source_pdf, output_path)

        return output_path

    except Exception as e:
        raise Exception(f"Excel to PDF conversion failed: {str(e)}")
