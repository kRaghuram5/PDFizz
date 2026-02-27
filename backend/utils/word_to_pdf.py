"""
Operation: Word (.doc / .docx) → PDF
Tries multiple conversion methods in order:
  1. LibreOffice (headless) - most reliable in Docker/Linux
  2. docx2pdf                - Windows / macOS
  3. comtypes (Word COM)    - Windows-only fallback
"""

import os
import subprocess
import platform
from .shared import docx2pdf_convert, HAVE_DOCX2PDF


def word_to_pdf(word_path, output_folder, unique_id):
    """
    Convert a Word document to PDF.

    Args:
        word_path:     Path to the input .doc / .docx file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the generated PDF file
    """
    try:
        output_path = os.path.join(output_folder, f"{unique_id}_output.pdf")

        # ── Method 1: LibreOffice (best for Docker / Linux) ─────────────────
        try:
            result = subprocess.run(
                [
                    'libreoffice', '--headless',
                    '--convert-to', 'pdf',
                    '--outdir', os.path.abspath(output_folder),
                    os.path.abspath(word_path),
                ],
                capture_output=True,
                timeout=60,
            )
            if result.returncode == 0:
                base      = os.path.splitext(os.path.basename(word_path))[0]
                temp_out  = os.path.join(output_folder, f"{base}.pdf")
                if os.path.exists(temp_out):
                    os.rename(temp_out, output_path)
                    return output_path
        except Exception:
            pass

        # ── Method 2: docx2pdf ───────────────────────────────────────────────
        if HAVE_DOCX2PDF:
            try:
                docx2pdf_convert(word_path, output_path)
                return output_path
            except Exception:
                pass

        # ── Method 3: comtypes via MS Word COM (Windows only) ────────────────
        if platform.system() == "Windows":
            try:
                import comtypes.client
                word_abs   = os.path.abspath(word_path)
                output_abs = os.path.abspath(output_path)

                word = comtypes.client.CreateObject("Word.Application")
                word.Visible = False
                doc = word.Documents.Open(word_abs)
                doc.SaveAs(output_abs, FileFormat=17)
                doc.Close()
                word.Quit()
                return output_path
            except Exception:
                pass

        raise Exception(
            "Word to PDF conversion failed. "
            "Ensure LibreOffice or docx2pdf is installed."
        )

    except Exception as e:
        raise Exception(f"Word to PDF conversion failed: {str(e)}")
