"""Enforcing output file arity."""
# TODO: Change this and see how it interacts with different values of 
# outputFiles in the Yaml tab.
N = 2

nzeros = len(str(N))
for i in range(N):
  with open(f'/output/{str(i).zfill(nzeros)}.txt', 'w') as f:
    f.write('foo')
