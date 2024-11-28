import fiolin
import os
import shutil
import sys
import tarfile
import zipfile

def get_mode_and_base(tarpath):
  if tarpath.endswith('.tar'):
    return 'r', os.path.basename(tarpath)[:-4]
  elif tarpath.endswith('.tar.gz'):
    return 'r:gz', os.path.basename(tarpath)[:-7]
  elif tarpath.endswith('.tar.bz2'):
    return 'r:bz2', os.path.basename(tarpath)[:-8]
  elif tarpath.endswith('.tbz2'):
    return 'r:bz2', os.path.basename(tarpath)[:-5]
  else:
    sys.exit(f'${tarpath} should end in .tar, .tar.gz, .tar.bz2, or .tbz2')

def has_subdirs(outdir):
  items = os.listdir(outdir)
  for i in items:
    if os.path.isdir(os.path.join(outdir, i)):
      return True
  return False

inpath = fiolin.get_input_path()
mode, base = get_mode_and_base(inpath)
with tarfile.open(inpath, mode) as tf:
  tf.extractall(path='/tmp', filter='data')

print('Extracted tar file to tmp:')
fiolin.tree('/tmp')

if has_subdirs('/tmp'):
  print('Tar file contained sub-directories. In order to preserve the ' +
        'structure of the extracted files, putting them in a zip archive.')
  inbase = fiolin.get_input_basename()
  with zipfile.ZipFile(f'/output/{base}.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('/tmp'):
      for file in files:
        file = os.path.join(root, file)
        zpath = os.path.relpath(file, '/tmp')
        zf.write(file, zpath)
else:
  print('Copying to /output')
  shutil.copytree('/tmp', '/output', dirs_exist_ok=True)
