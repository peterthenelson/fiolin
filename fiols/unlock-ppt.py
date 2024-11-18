import fiolin
import os.path
import re
import zipfile

input = fiolin.get_input_basename()
stem, ext = os.path.splitext(input)
output = stem + '-unlocked' + ext

print(f'Unzipping {input} to /tmp/unzipped...')
os.mkdir('/tmp/unzipped')
zipfile.ZipFile(os.path.join('/input', input)).extractall('/tmp/unzipped')

print('Rewriting ppt/presentation.xml...')
with open('/tmp.xml', 'w') as outfile:
  with open('/tmp/unzipped/ppt/presentation.xml') as infile:
    for line in infile:
      outfile.write(re.sub(r'<p:modifyVerifier [^>]+>', '', line))
os.remove('/tmp/unzipped/ppt/presentation.xml')
os.rename('/tmp.xml', '/tmp/unzipped/ppt/presentation.xml')

print(f'Zipping /tmp/unzipped up as {output}...')
with zipfile.ZipFile(os.path.join('/output', output), 'w', zipfile.ZIP_DEFLATED) as zf:
  for root, dirs, files in os.walk('/tmp/unzipped'):
    for file in files:
      path = os.path.join(root, file)
      arcname = os.path.relpath(path, '/tmp/unzipped')
      zf.write(path, arcname=arcname)

print('Done')
