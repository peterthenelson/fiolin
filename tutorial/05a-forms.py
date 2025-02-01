"""Somebody set up us the bomb."""
import fiolin
import sys

def caesar(s):
  """Thus always to ciphers!"""
  a = ord('a')
  enc = ''
  for c in s:
    if c.isalpha():
      enc += chr(a + (ord(c) - a + 3) % 26)
    else:
      enc += c
  return enc

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
  if caesar(args['cake']) != 'vkxwgrzq-jodgrv':
    print("I'm afraid you're about to become the immediate past president of "
          "the Being Alive club!", file=sys.stderr)
  else:
    print('You defused the bomb!')
    print('This was a triumph.')
    print('I\'m making a note here: "Huge success"...')
