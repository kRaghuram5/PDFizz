"""
Operation: Add Watermark
Adds a text watermark to every page of a PDF.

Supported positions:
    top-left    top-center    top-right
    center-left center        center-right
    bottom-left bottom-center bottom-right

Fonts (fitz font names):  helv (Helvetica) · tiro (Times) · cour (Courier)
Color: CSS hex string, e.g. '#888888'
"""

import os
from .shared import fitz, HAVE_FITZ


def add_watermark(pdf_path, output_folder, unique_id,
                  watermark_text,
                  position='center',
                  font='helv',
                  color='#888888',
                  font_size=36):
    """
    Stamp a text watermark on every page of a PDF.

    Requires:  PyMuPDF (fitz)
    Args:
        pdf_path:       Path to the input PDF file
        output_folder:  Directory where the output file will be saved
        unique_id:      Unique identifier used to name the output file
        watermark_text: Text to stamp onto each page
        position:       Placement string, e.g. 'center', 'top-left', 'bottom-right'
        font:           Font name (helv / tiro / cour)
        color:          Hex colour string, e.g. '#888888'
        font_size:      Font size in points
    Returns:
        Path to the watermarked PDF file
    """
    if not HAVE_FITZ:
        raise Exception(
            "PyMuPDF (fitz) is not installed. "
            "Install it with:  python -m pip install PyMuPDF"
        )

    try:
        output_path = os.path.join(output_folder, f"{unique_id}_watermarked.pdf")

        # Parse hex colour → (r, g, b) floats in [0, 1]
        hex_c = color.lstrip('#')
        if len(hex_c) == 3:
            hex_c = ''.join(c * 2 for c in hex_c)
        rgb = (
            int(hex_c[0:2], 16) / 255,
            int(hex_c[2:4], 16) / 255,
            int(hex_c[4:6], 16) / 255,
        )

        font_size = int(font_size)
        parts  = position.split('-')
        vert   = parts[0]                             # top / center / bottom
        horiz  = parts[1] if len(parts) > 1 else 'center'  # left / center / right

        font_obj = fitz.Font(fontname=font)

        doc = fitz.open(pdf_path)
        for page in doc:
            pw, ph = page.rect.width, page.rect.height
            margin = 24

            # Vertical position
            if vert == 'top':
                y = margin + font_size
            elif vert == 'bottom':
                y = ph - margin
            else:
                y = ph / 2

            if vert == 'center' and horiz == 'center':
                # Diagonal watermark across the page
                tw      = fitz.TextWriter(page.rect, color=rgb)
                half_w  = len(watermark_text) * font_size * 0.28
                origin  = fitz.Point(pw / 2 - half_w, ph / 2)
                tw.append(origin, watermark_text, font=font_obj, fontsize=font_size)
                pivot   = fitz.Point(pw / 2, ph / 2)
                tw.write_text(page, morph=(pivot, fitz.Matrix(-45)))
            else:
                text_width = font_obj.text_length(watermark_text, fontsize=font_size)

                if horiz == 'left':
                    x = margin
                elif horiz == 'right':
                    x = pw - margin - text_width
                else:
                    x = (pw - text_width) / 2

                tw = fitz.TextWriter(page.rect, color=rgb)
                tw.append(fitz.Point(x, y), watermark_text, font=font_obj, fontsize=font_size)
                tw.write_text(page)

        doc.save(output_path)
        doc.close()
        return output_path

    except Exception as e:
        raise Exception(f"Watermark addition failed: {str(e)}")
