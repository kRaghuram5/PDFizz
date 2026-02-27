"""
Operation: Images → PDF
Combines one or more image files (PNG, JPG, etc.) into a single PDF.
"""

import os
from .shared import Image, HAVE_PIL


def images_to_pdf(image_paths, output_folder, unique_id):
    """
    Merge multiple image files into a single PDF document.

    Requires:  Pillow (PIL)
    Args:
        image_paths:   List of paths to input image files
        output_folder: Directory where the output file will be saved
        unique_id:     Unique identifier used to name the output file
    Returns:
        Path to the generated PDF file
    """
    if not HAVE_PIL:
        raise Exception(
            "Pillow is not installed. "
            "Install it with:  python -m pip install Pillow"
        )

    try:
        output_path = os.path.join(output_folder, f"{unique_id}_output.pdf")

        # Open every image and convert to RGB (PDF requires RGB)
        images = []
        for img_path in image_paths:
            img = Image.open(img_path)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            images.append(img)

        if images:
            images[0].save(
                output_path,
                save_all=True,
                append_images=images[1:] if len(images) > 1 else [],
            )

        return output_path

    except Exception as e:
        raise Exception(f"Images to PDF conversion failed: {str(e)}")
