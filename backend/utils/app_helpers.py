"""
Helper functions used by app.py:
  - allowed_file           → validate uploaded file extension
  - save_uploaded_file     → save upload to disk (+ Azure if enabled)
  - save_output_file       → upload output to Azure, delete local copy
  - smart_rename_output    → rename output file using the input's base name
  - cleanup_old_files      → background thread: delete files older than 1 hour
"""

import os
import time
import threading
from werkzeug.utils import secure_filename

# ──────────────────────────────────────────────
# Allowed upload extensions by category
# ──────────────────────────────────────────────

ALLOWED_EXTENSIONS = {
    'pdf':   ['pdf'],
    'word':  ['doc', 'docx'],
    'text':  ['txt'],
    'image': ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'tiff', 'tif', 'webp', 'svg', 'ico'],
    'pptx':  ['ppt', 'pptx'],
    'excel': ['xls', 'xlsx'],
}


def allowed_file(filename, file_type):
    """Return True if the file extension matches the expected type."""
    return (
        '.' in filename and
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS.get(file_type, [])
    )


# ──────────────────────────────────────────────
# File storage helpers
# ──────────────────────────────────────────────

def save_uploaded_file(file, unique_id, upload_folder, azure_storage=None, use_azure=False):
    """
    Save an uploaded file temporarily for processing.
    If Azure is enabled the file is also uploaded there.

    Returns:
        Local file path (used for processing)
    """
    filename      = secure_filename(file.filename)
    local_path    = os.path.join(upload_folder, f"{unique_id}_{filename}")
    file.save(local_path)

    if use_azure and azure_storage:
        try:
            blob_name = f"uploads/{unique_id}/{filename}"
            azure_storage.upload_file(local_path, blob_name)
        except Exception as e:
            print(f"[Azure] Upload failed (continuing locally): {e}")

    return local_path


def save_output_file(local_path, unique_id, azure_storage=None, use_azure=False):
    """
    Upload an output file to Azure and delete the local copy.

    Returns:
        (filename, blob_name)  –  blob_name is None when Azure is disabled
    """
    if not local_path or not os.path.exists(local_path):
        return None, None

    filename  = os.path.basename(local_path)
    blob_name = f"outputs/{unique_id}/{filename}"

    if use_azure and azure_storage:
        try:
            azure_storage.upload_file(local_path, blob_name)
            # Remove local copy after successful Azure upload
            try:
                os.remove(local_path)
            except Exception as e:
                print(f"[Cleanup] Could not delete temp file {local_path}: {e}")
        except Exception as e:
            print(f"[Azure] Output upload failed: {e}")
            return filename, None   # serve locally as fallback

    return filename, blob_name if use_azure else None


def smart_rename_output(output_file, base_name):
    """
    Rename the output file to  <base_name><ext>, resolving conflicts with a counter.

    Example:  unique_id_output.docx  →  my_document_word.docx
    """
    if not output_file or not os.path.exists(output_file):
        return output_file

    try:
        _, ext        = os.path.splitext(output_file)
        output_dir    = os.path.dirname(output_file)
        new_filename  = f"{base_name}{ext}"
        new_path      = os.path.join(output_dir, new_filename)

        counter = 1
        while os.path.exists(new_path):
            # Strip trailing counter if already present
            parts = base_name.rsplit('_', 1)
            root  = parts[0] if (len(parts) > 1 and parts[-1].isdigit()) else base_name
            new_filename = f"{root}_{counter}{ext}"
            new_path     = os.path.join(output_dir, new_filename)
            counter += 1

        os.rename(output_file, new_path)
        return new_path

    except Exception as e:
        print(f"[Rename] Error: {e}")
        return output_file


# ──────────────────────────────────────────────
# Background cleanup thread
# ──────────────────────────────────────────────

def start_cleanup_thread(upload_folder, output_folder, max_age_seconds=3600):
    """
    Start a daemon thread that deletes files older than max_age_seconds
    from upload_folder and output_folder every 30 minutes.
    """
    def _cleanup():
        while True:
            try:
                now = time.time()
                for folder in [upload_folder, output_folder]:
                    if not os.path.exists(folder):
                        continue
                    for filename in os.listdir(folder):
                        filepath = os.path.join(folder, filename)
                        if os.path.isfile(filepath):
                            if now - os.path.getmtime(filepath) > max_age_seconds:
                                os.remove(filepath)
                                print(f"[Cleanup] Deleted old file: {filepath}")
            except Exception as e:
                print(f"[Cleanup] Error: {e}")
            time.sleep(1800)   # run every 30 minutes

    t = threading.Thread(target=_cleanup, daemon=True)
    t.start()
    return t
