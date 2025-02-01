"""Draw some pictures."""
import fiolin
import math
import sys

ctx = fiolin.get_canvas('output')
DIM = 400
routine = fiolin.args()['routine']
ctx.clearRect(0, 0, DIM, DIM)
if routine == 'square':
  ctx.fillStyle = 'red'
  ctx.fillRect(DIM/4, DIM/4, DIM/2, DIM/2)
elif routine == 'smiley':
  ctx.beginPath()
  ctx.arc(DIM/2, DIM/2, DIM/4, 0, math.pi * 2)
  ctx.fillStyle = 'yellow'
  ctx.fill()
  ctx.closePath()
  ctx.beginPath()
  ctx.arc(DIM/2, DIM/2, DIM/4, 0, math.pi * 2)
  ctx.lineWidth = 5
  ctx.strokeStyle = 'black'
  ctx.stroke()
  ctx.closePath()
  ctx.fillStyle = 'black'
  # TODO: Make the smiley not a cyclops
  ctx.beginPath()
  ctx.ellipse(DIM/2, DIM/2-30, 7, 10, 0, 0, math.pi * 2)
  ctx.fill()
  ctx.closePath()
  ctx.beginPath()
  ctx.arc(DIM/2, DIM/2, 55, 0, math.pi, False)
  ctx.lineWidth = 5
  ctx.strokeStyle = 'black'
  ctx.stroke()
  ctx.closePath()
elif routine == 'loss':
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, DIM, DIM)
  ctx.fillStyle = 'black'
  ctx.fillRect(0, DIM/2-2, DIM, 4)
  ctx.fillRect(DIM/2-2, 0, 4, DIM)
  ctx.fillRect(DIM/6, DIM/4, 4, DIM/2)
  ctx.fillRect(2*DIM/6, DIM/2, 4, DIM/4)
  ctx.fillRect(4*DIM/6+4, DIM/4, 4, DIM/2-20)
  ctx.fillRect(5*DIM/6+4, 3*DIM/8, 4, DIM/8)
  ctx.fillRect(DIM/2+30, DIM/4+DIM/2-20, 3*DIM/8, 4)
else:
  sys.exit(f'Unexpected routine: {routine}')
