import js
import os.path
import tnefparse # type: ignore

input = js.inputs[0]
stem, ext = os.path.splitext(input)
js.outputs = []

print(f'Opening {input}')
tnef_bytes = open(os.path.join('/input', input), 'rb').read()
tnef = tnefparse.TNEF(tnef_bytes, do_checksum=True)
for attachment in tnef.attachments:
  print(f'  Unpacking attachment {attachment.name}')
  with open(os.path.join('/output', attachment.name), 'wb') as outfile:
    outfile.write(attachment.data)
  js.outputs.append(attachment.name)
print(f'Unpacked {len(js.outputs)} attachments')

print('Done')
