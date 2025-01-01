"""Somebody set up us the bomb."""
import fiolin
import sys
import base64

# TODO: Try out filling the form in in different ways in order to defuse the
# bomb. No editing the python! (But what about the yaml...?)
args = fiolin.args()
if args['wire'] != 'blue':
  print('Oops, you cut the wrong wire!', file=sys.stderr)
elif args['secret-code'] != 'CAPS':
  print('Oops, you entered the wrong code!', file=sys.stderr)
elif args['cake'] in ['yes', 'no']:
  print('Sorry, the cake is a lie')
else:
  encoded = base64.b64encode(args['cake'].encode('utf-8')).decode('utf-8')
  if encoded != 'Z2xhZG9zLXNodXRkb3du':
    print("I'm afraid you're about to become the immediate past president of "
            "the Being Alive club!", file=sys.stderr)
  else:
    print('You defused the bomb!')
    print('This was a triumph...')
