"""Copy a PDF, keeping only every other page."""
import fiolin
import os
# TODO: Edit the yaml file to install the right package
import pypdf

reader = pypdf.PdfReader(fiolin.get_input_path())
writer = pypdf.PdfWriter()
for i in range(len(reader.pages)):
  if i % 2 == 0:
    writer.add_page(reader.pages[i])
writer.write(f'/output/{fiolin.get_input_basename(suffix='-odd-pages')}')
