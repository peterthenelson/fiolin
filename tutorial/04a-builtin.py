"""Converting images into data URIs using Pillow for image encoding."""
import fiolin
import base64
import io
from PIL import Image

with Image.open(fiolin.get_input_path()) as img:
  with io.BytesIO() as bio:
    img.save(bio, format="PNG")
    bio.seek(0)
    encoded = base64.b64encode(bio.read()).decode('utf-8')
    print(f'data:image/png;base64,{encoded}')
