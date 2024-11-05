import fiolin
import os.path
import re
import zipfile

input = fiolin.get_input_basename()
stem, ext = os.path.splitext(input)
output = stem + '-unlocked' + ext

print(f'Unzipping {input} to /ppt-tmp...')
os.mkdir('/ppt-tmp')
zipfile.ZipFile(os.path.join('/input', input)).extractall('/ppt-tmp')

print('Rewriting ppt/presentation.xml...')
with open('/tmp.xml', 'w') as outfile:
  with open('/ppt-tmp/ppt/presentation.xml') as infile:
    for line in infile:
      outfile.write(re.sub(r'<p:modifyVerifier [^>]+>', '', line))
os.remove('/ppt-tmp/ppt/presentation.xml')
os.rename('/tmp.xml', '/ppt-tmp/ppt/presentation.xml')

print(f'Zipping /ppt-tmp up as {output}...')
with zipfile.ZipFile(os.path.join('/output', output), 'w', zipfile.ZIP_DEFLATED) as zf:
  for root, dirs, files in os.walk('/ppt-tmp'):
    for file in files:
      path = os.path.join(root, file)
      arcname = os.path.relpath(path, '/ppt-tmp')
      zf.write(path, arcname=arcname)

fiolin.auto_set_outputs()
print('Done')
