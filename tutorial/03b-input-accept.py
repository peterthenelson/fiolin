"""Find the degree of nesting of xml and json documents."""
import fiolin
import os
import json
import sys
from xml.etree import ElementTree

def xml_depth(path):
  def depth(el):
    if len(el) == 0:
      return 1
    else:
      return 1 + max(depth(child) for child in el)
  with open(path) as f:
    return depth(ElementTree.fromstring(f.read()))

def json_depth(path):
  def maybe_max(it):
    return max(it) if it else 0
  def depth(o):
    if isinstance(o, dict):
      return 1 + maybe_max(depth(value) for value in o.values())
    elif isinstance(o, list):
      return 1 + maybe_max(depth(item) for item in o)
    else:
      return 1
  with open(path) as f:
    return depth(json.load(f))

# TODO: Change the yaml file so that this script accepts xml and json files
# only.
_, ext = os.path.splitext(fiolin.get_input_basename())
if ext == '.xml':
  print(f'Xml file has a depth of {xml_depth(fiolin.get_input_path())}')
elif ext == '.json':
  print(f'Json file has a depth of {json_depth(fiolin.get_input_path())}')
else:
  sys.exit(f'Unexpected file type: {ext}')
