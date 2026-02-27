"""
utils package
=============
Re-exports every operation function so callers can do:

    from utils import pdf_to_word, merge_pdfs, ...   (or)
    from utils.pdf_to_word import pdf_to_word

Structure
---------
shared.py               – optional-dependency flags shared by all modules

# PDF → other formats
pdf_to_word.py          – pdf_to_word
pdf_to_text.py          – pdf_to_text
pdf_to_images.py        – pdf_to_images
pdf_to_powerpoint.py    – pdf_to_powerpoint

# other formats → PDF
word_to_pdf.py          – word_to_pdf
text_to_pdf.py          – text_to_pdf
images_to_pdf.py        – images_to_pdf
powerpoint_to_pdf.py    – powerpoint_to_pdf
excel_to_pdf.py         – excel_to_pdf

# PDF page manipulation
merge_pdfs.py           – merge_pdfs
split_pdf.py            – split_pdf, split_pdf_custom_ranges,
                          split_pdf_fixed, split_pdf_extract_pages
reverse_pdf.py          – reverse_pdf
remove_pages.py         – remove_pages

# PDF transformation / enhancement
compress_pdf.py         – compress_pdf
rotate_pdf.py           – rotate_pdf
watermark.py            – add_watermark
page_numbers.py         – add_page_numbers
repair_pdf.py           – repair_pdf

# Image utilities
extract_images.py       – extract_images_from_pdf

# App-level helpers (used by app.py)
app_helpers.py          – allowed_file, save_uploaded_file, save_output_file,
                          smart_rename_output, start_cleanup_thread
"""

# ── PDF → other formats ──────────────────────────────────────────────────────
from .pdf_to_word       import pdf_to_word
from .pdf_to_text       import pdf_to_text
from .pdf_to_images     import pdf_to_images
from .pdf_to_powerpoint import pdf_to_powerpoint

# ── other formats → PDF ──────────────────────────────────────────────────────
from .word_to_pdf       import word_to_pdf
from .text_to_pdf       import text_to_pdf
from .images_to_pdf     import images_to_pdf
from .powerpoint_to_pdf import powerpoint_to_pdf
from .excel_to_pdf      import excel_to_pdf

# ── PDF page manipulation ────────────────────────────────────────────────────
from .merge_pdfs        import merge_pdfs
from .split_pdf         import (split_pdf, split_pdf_custom_ranges,
                                split_pdf_fixed, split_pdf_extract_pages)
from .reverse_pdf       import reverse_pdf
from .remove_pages      import remove_pages

# ── PDF transformation / enhancement ────────────────────────────────────────
from .compress_pdf      import compress_pdf
from .rotate_pdf        import rotate_pdf
from .watermark         import add_watermark
from .page_numbers      import add_page_numbers
from .repair_pdf        import repair_pdf

# ── Image utilities ──────────────────────────────────────────────────────────
from .extract_images    import extract_images_from_pdf

# ── App helpers ──────────────────────────────────────────────────────────────
from .app_helpers       import (allowed_file, save_uploaded_file,
                                save_output_file, smart_rename_output,
                                start_cleanup_thread)

__all__ = [
    # PDF → other
    'pdf_to_word', 'pdf_to_text', 'pdf_to_images', 'pdf_to_powerpoint',
    # other → PDF
    'word_to_pdf', 'text_to_pdf', 'images_to_pdf', 'powerpoint_to_pdf', 'excel_to_pdf',
    # page manipulation
    'merge_pdfs', 'split_pdf', 'split_pdf_custom_ranges',
    'split_pdf_fixed', 'split_pdf_extract_pages',
    'reverse_pdf', 'remove_pages',
    # transformation
    'compress_pdf', 'rotate_pdf', 'add_watermark', 'add_page_numbers', 'repair_pdf',
    # images
    'extract_images_from_pdf',
    # helpers
    'allowed_file', 'save_uploaded_file', 'save_output_file',
    'smart_rename_output', 'start_cleanup_thread',
]
