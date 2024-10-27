import js
import os.path
import re
import zipfile

stem, ext = os.path.splitext(js.inFileName)
js.outFileName = stem + '-unlocked' + ext

print(f'Unzipping {js.inFileName} to /ppt-tmp...')
os.mkdir('/ppt-tmp')
zipfile.ZipFile(os.path.join('/input', js.inFileName)).extractall('/ppt-tmp')

print('Rewriting ppt/presentation.xml...')
with open('/tmp.xml', 'w') as outfile:
  with open('/ppt-tmp/ppt/presentation.xml') as infile:
    for line in infile:
      outfile.write(re.sub(r'<p:modifyVerifier [^>]+>', '', line))

print(f'Zipping /ppt-tmp up as {js.outFileName}...')
with zipfile.ZipFile(os.path.join('/output', js.outFileName), 'w', zipfile.ZIP_DEFLATED) as zf:
  for root, dirs, files in os.walk('/ppt-tmp'):
    for file in files:
      path = os.path.join(root, file)
      arcname = os.path.relpath(path, '/ppt-tmp')
      zf.write(path, arcname=arcname)

print('Done')
