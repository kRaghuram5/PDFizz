"""
Shared imports and optional-dependency flags used by all operation modules.

Each operation file imports only what it needs from here, instead of
repeating the try/except pattern in every file.
"""

import os
import shutil
import zipfile
import subprocess
import platform
import math
from datetime import datetime

import PyPDF2

# ──────────────────────────────────────────────
# Optional dependencies – fail gracefully
# ──────────────────────────────────────────────

try:
    import fitz          # PyMuPDF
    HAVE_FITZ = True
except Exception:
    fitz = None
    HAVE_FITZ = False

try:
    from pdf2docx import Converter
    HAVE_PDF2DOCX = True
except Exception:
    Converter = None
    HAVE_PDF2DOCX = False

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    HAVE_REPORTLAB = True
except Exception:
    canvas = None
    letter = None
    HAVE_REPORTLAB = False

try:
    from PIL import Image
    HAVE_PIL = True
except Exception:
    Image = None
    HAVE_PIL = False

try:
    from docx2pdf import convert as docx2pdf_convert
    HAVE_DOCX2PDF = True
except Exception:
    docx2pdf_convert = None
    HAVE_DOCX2PDF = False

try:
    from pptx import Presentation
    HAVE_PPTX = True
except Exception:
    Presentation = None
    HAVE_PPTX = False

try:
    from openpyxl import load_workbook
    HAVE_OPENPYXL = True
except Exception:
    load_workbook = None
    HAVE_OPENPYXL = False
