"""Strip EXIF data from images."""
import fiolin
from PIL import ExifTags, Image

with Image.open(fiolin.get_input_path()) as img:
  exif = img.getexif()
  if exif:
    print('Removing the following Exif data:')
    for k, v in exif.items():
      print(f'  {ExifTags.TAGS.get(k, k)}: {v}')
  else:
    print('No Exif data found!')
  # Strips out exif automatically on save unless you manually pass it in here.
  img.save(f'/output/{fiolin.get_input_basename(suffix='-no-exif')}')
