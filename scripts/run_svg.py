"""python scripts/run_svg.py (from project root)"""

tmpl = '''<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1.5em"
  height="1em"
  viewBox="0 0 150 100"
>
  <path d="{0}"
    stroke="currentColor" fill="none" stroke-width="7"
  />
</svg>
'''

def lin(p1, p2, t):
  tc = 1-t
  return (tc*p1[0]+t*p2[0], tc*p1[1]+t*p2[1])

def ave(p1, p2):
  return lin(p1, p2, 0.5)

def p2s(p):
  return f'{p[0]},{p[1]}'

def gen(points, t):
  path = [f'M {p2s(lin(points[0], points[1], t))}']
  for i1, p1 in enumerate(points):
    i2 = (i1 + 1) % len(points)
    p2 = points[i2]
    i3 = (i1 + 2) % len(points)
    p3 = points[i3]
    line_end = lin(p1, p2, 1-t)
    ctrl1 = lin(p1, p2, 1-0.2*t)
    ctrl2 = lin(p2, p3, 0.2*t)
    next_line_start = lin(p2, p3, t)
    path.append(f'L {p2s(line_end)}')
    path.append(f'C {p2s(ctrl1)} {p2s(ctrl2)} {p2s(next_line_start)}')
  return ' '.join(path)

with open('server/public/run.svg', 'w') as f:
  points = [(47,15), (120,50), (47,85)]
  f.write(tmpl.format(gen(points, 0.2)))
