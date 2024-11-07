import fiolin
import os
import pypdf # type: ignore
import sys

inputs = fiolin.smart_sort(fiolin.get_input_basenames())
if not inputs:
  sys.exit(f'Expected at least one input; got {len(inputs)}')
# TODO: Support optionally respecting input order
print('Merging PDFs in the following order:')
writer = pypdf.PdfWriter()
for f in inputs:
  print(f'  {f}')
  writer.append(f'/input/{f}')
# Try to choose a filename that the use would have picked
output = os.path.commonprefix(inputs)
if not output:
  output = 'merged'
elif f'{output}.pdf' in inputs:
  output = f'{output}-merged'
writer.write(f'/output/{output}.pdf')
print(f'Combined PDF: {output}.pdf')
