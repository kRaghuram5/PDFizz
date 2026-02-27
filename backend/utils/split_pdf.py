"""
Operation: Split PDF
Four split modes:
  - split_pdf                  → extract a simple page range (start–end)
  - split_pdf_custom_ranges    → split by multiple custom ranges; optionally merge results
  - split_pdf_fixed            → split into N roughly equal parts
  - split_pdf_extract_pages    → cherry-pick individual pages into a new PDF
"""

import os
import shutil
import zipfile
import PyPDF2


# ─────────────────────────────────────────────────────────────────────────────
# Mode 1 – Simple range
# ─────────────────────────────────────────────────────────────────────────────

def split_pdf(pdf_path, output_folder, unique_id, start_page, end_page):
    """
    Extract pages start_page..end_page (1-based, inclusive) into a new PDF.

    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
        start_page:    First page to include (1-based)
        end_page:      Last page to include (1-based, inclusive)
    Returns:
        Path to the extracted PDF file
    """
    try:
        output_path = os.path.join(output_folder, f"{unique_id}_split.pdf")

        reader = PyPDF2.PdfReader(pdf_path)
        writer = PyPDF2.PdfWriter()

        start = max(0, start_page - 1)                   # → 0-based
        end   = min(len(reader.pages), end_page)          # → 0-based exclusive

        for i in range(start, end):
            writer.add_page(reader.pages[i])

        with open(output_path, 'wb') as f:
            writer.write(f)

        return output_path

    except Exception as e:
        raise Exception(f"PDF splitting failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# Mode 2 – Custom ranges
# ─────────────────────────────────────────────────────────────────────────────

def split_pdf_custom_ranges(pdf_path, output_folder, unique_id, ranges, merge=False):
    """
    Split a PDF into separate files according to a list of page ranges.

    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
        ranges:        List of dicts with 'from' and 'to' keys (1-based, inclusive)
        merge:         If True, combine all extracted ranges into a single PDF
    Returns:
        Path to a single PDF (if merge=True or only one range) or a ZIP of PDFs
    """
    try:
        reader      = PyPDF2.PdfReader(pdf_path)
        total_pages = len(reader.pages)
        temp_dir    = os.path.join(output_folder, f"{unique_id}_split_parts")
        os.makedirs(temp_dir, exist_ok=True)

        part_files = []
        for idx, r in enumerate(ranges, 1):
            start = max(0, int(r.get('from', 1)) - 1)
            end   = min(total_pages, int(r.get('to', total_pages)))

            writer = PyPDF2.PdfWriter()
            for i in range(start, end):
                writer.add_page(reader.pages[i])

            part_path = os.path.join(temp_dir, f"part_{idx}_pages_{start+1}-{end}.pdf")
            with open(part_path, 'wb') as f:
                writer.write(f)
            part_files.append(part_path)

        # Merge all ranges into one PDF
        if merge and len(part_files) > 1:
            merged_writer = PyPDF2.PdfWriter()
            for pp in part_files:
                pr = PyPDF2.PdfReader(pp)
                for page in pr.pages:
                    merged_writer.add_page(page)
            merged_out = os.path.join(output_folder, f"{unique_id}_split_merged.pdf")
            with open(merged_out, 'wb') as f:
                merged_writer.write(f)
            shutil.rmtree(temp_dir, ignore_errors=True)
            return merged_out

        # Single range → return one PDF
        if len(part_files) == 1:
            single_out = os.path.join(output_folder, f"{unique_id}_split.pdf")
            shutil.move(part_files[0], single_out)
            shutil.rmtree(temp_dir, ignore_errors=True)
            return single_out

        # Multiple ranges → ZIP
        zip_path = os.path.join(output_folder, f"{unique_id}_split.zip")
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for pp in part_files:
                zf.write(pp, os.path.basename(pp))
        shutil.rmtree(temp_dir, ignore_errors=True)
        return zip_path

    except Exception as e:
        raise Exception(f"PDF custom range split failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# Mode 3 – Fixed / equal parts
# ─────────────────────────────────────────────────────────────────────────────

def split_pdf_fixed(pdf_path, output_folder, unique_id, num_parts):
    """
    Split a PDF into num_parts roughly equal pieces.

    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
        num_parts:     Number of equal parts to split into
    Returns:
        Path to a single PDF (if num_parts=1) or a ZIP of PDFs
    """
    try:
        reader      = PyPDF2.PdfReader(pdf_path)
        total_pages = len(reader.pages)
        num_parts   = max(1, min(int(num_parts), total_pages))

        pages_per_part = total_pages // num_parts
        remainder      = total_pages % num_parts

        temp_dir = os.path.join(output_folder, f"{unique_id}_split_parts")
        os.makedirs(temp_dir, exist_ok=True)

        part_files   = []
        current_page = 0
        for i in range(num_parts):
            part_size = pages_per_part + (1 if i < remainder else 0)

            writer = PyPDF2.PdfWriter()
            for _ in range(part_size):
                writer.add_page(reader.pages[current_page])
                current_page += 1

            start_pg  = current_page - part_size + 1
            end_pg    = current_page
            part_path = os.path.join(temp_dir, f"part_{i+1}_pages_{start_pg}-{end_pg}.pdf")
            with open(part_path, 'wb') as f:
                writer.write(f)
            part_files.append(part_path)

        if len(part_files) == 1:
            single_out = os.path.join(output_folder, f"{unique_id}_split.pdf")
            shutil.move(part_files[0], single_out)
            shutil.rmtree(temp_dir, ignore_errors=True)
            return single_out

        zip_path = os.path.join(output_folder, f"{unique_id}_split.zip")
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for pp in part_files:
                zf.write(pp, os.path.basename(pp))
        shutil.rmtree(temp_dir, ignore_errors=True)
        return zip_path

    except Exception as e:
        raise Exception(f"PDF fixed split failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# Mode 4 – Cherry-pick pages
# ─────────────────────────────────────────────────────────────────────────────

def split_pdf_extract_pages(pdf_path, output_folder, unique_id, pages):
    """
    Extract a specific set of pages (by number) into a new PDF.

    Args:
        pdf_path:      Path to the input PDF file
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
        pages:         List of 1-based page numbers to extract
    Returns:
        Path to the extracted PDF file
    """
    try:
        reader      = PyPDF2.PdfReader(pdf_path)
        total_pages = len(reader.pages)
        output_path = os.path.join(output_folder, f"{unique_id}_split.pdf")

        writer = PyPDF2.PdfWriter()
        for page_num in sorted(set(pages)):
            if 1 <= page_num <= total_pages:
                writer.add_page(reader.pages[page_num - 1])

        with open(output_path, 'wb') as f:
            writer.write(f)

        return output_path

    except Exception as e:
        raise Exception(f"PDF page extraction failed: {str(e)}")
