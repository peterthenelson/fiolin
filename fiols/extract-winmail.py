import fiolin
import os.path
import tnefparse # type: ignore

input = fiolin.get_input_basename()
stem, ext = os.path.splitext(input)

print(f'Opening {input}')
tnef_bytes = open(f'/input/{input}', 'rb').read()
tnef = tnefparse.TNEF(tnef_bytes, do_checksum=True)
for attachment in tnef.attachments:
  print(f'  Unpacking attachment {attachment.name}')
  with open(f'/output/{attachment.name}', 'wb') as outfile:
    outfile.write(attachment.data)
print(f'Unpacked {len(tnef.attachments)} attachments')

fiolin.auto_set_outputs()
print('Done')
