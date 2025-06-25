from pdf2image import convert_from_path
import os

def convert_pdf_to_image(pdf_path, output_folder):
    images = convert_from_path(pdf_path)
    if not images:
        return None
    image_path = os.path.join(output_folder, os.path.basename(pdf_path) + '.jpg')
    images[0].save(image_path, 'JPEG')
    return image_path
