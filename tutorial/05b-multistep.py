"""This space left intentionally blank."""
import fiolin
import sys

RUG_MSG = (
  'With great effort, the rug is moved to one side of the room, revealing the '
  'dusty cover of a closed trap door.'
)
TRAPDOOR_OPEN_MSG = (
  'The door reluctantly opens to reveal a rickety staircase descending into '
  'darkness.'
)
TRAPDOOR_ENTER_MSG = (
  'You have moved into a dark place. The trap door crashes shut, and you hear '
  'someone barring it. It is pitch black. You are likely to be eaten by a grue.'
)
TROPHY_CASE_MSG = 'A battery-powered brass lantern is on the trophy case.'
TAKE_LAMP_MSG = 'Taken.'
LAMP_MSG = 'Oh good, no grues. You are just trapped in a regular dungeon. FIN'
TWIDDLE_MSG = 'Oh no! You have walked in the slavering fangs of a lurking grue!'

state = fiolin.state() or { 'lamp': False }
action = fiolin.args()['action']
if action == 'rug':
  fiolin.form_set_hidden('action', 'rug', hidden=True)
  fiolin.form_set_hidden('action', 'open-trapdoor', hidden=False)
  fiolin.form_set_value('output', RUG_MSG)
elif action == 'open-trapdoor':
  fiolin.form_set_hidden('action', 'open-trapdoor', hidden=True)
  fiolin.form_set_hidden('action', 'enter-trapdoor', hidden=False)
  fiolin.form_set_value('output', TRAPDOOR_OPEN_MSG)
elif action == 'enter-trapdoor':
  fiolin.form_set_hidden('action', 'enter-trapdoor', hidden=True)
  fiolin.form_set_hidden('action', 'trophy-case', hidden=True)
  if state['lamp']:
    fiolin.form_set_hidden('action', 'lamp', hidden=False)
  fiolin.form_set_hidden('action', 'twiddle', hidden=False)
  fiolin.form_set_value('output', TRAPDOOR_ENTER_MSG)
elif action == 'trophy-case':
  fiolin.form_set_hidden('action', 'trophy-case', hidden=True)
  fiolin.form_set_hidden('action', 'take-lamp', hidden=False)
  fiolin.form_set_value('output', TROPHY_CASE_MSG)
elif action == 'take-lamp':
  # TODO: Oops, something is missing in this branch
  fiolin.form_set_hidden('action', 'take-lamp', hidden=True)
  fiolin.form_set_value('output', TAKE_LAMP_MSG)
elif action == 'lamp':
  fiolin.form_set_hidden('action', 'lamp', hidden=True)
  fiolin.form_set_hidden('action', 'twiddle', hidden=True)
  fiolin.form_set_value('output', LAMP_MSG)
  # Not technically needed, but for a real script where you want to trigger a
  # file download, this may be needed.
  fiolin.finish()
  sys.exit(0)
elif action == 'twiddle':
  fiolin.form_set_hidden('action', 'twiddle', hidden=True)
  fiolin.form_set_value('output', TWIDDLE_MSG)
  sys.exit('YOU DIED')
else:
  sys.exit(f'Unexpected action: {action}')

fiolin.continue_with(state)
