"""Terminal modes."""
import fiolin
import sys

# Aliased for convenience
DEBUG = fiolin.DEBUG
INFO = fiolin.INFO
WARN = fiolin.WARN
ERROR = fiolin.ERROR

# TODO: Play with these statements and see how they interact with different
# values of terminal in the Yaml tab.
fiolin.log(DEBUG, 'Debug is the lowest log level')
fiolin.log(DEBUG, 'By default it\'s only used by library code')
fiolin.log(INFO, 'Next is INFO')
print('INFO is treated as equivalent to writing to stdout')
fiolin.log(WARN, 'Warn is the third level')
fiolin.log(ERROR, 'Error is the fourth one')
print('ERROR is treated as equivalent to writing to stderr', file=sys.stderr)
print('TEXT is the default terminal mode and just shows the INFO/ERROR logs')
fiolin.log(INFO, 'The LOG view shows all the log entries and their levels')
fiolin.log(ERROR, 'FATAL_ONLY hides the panel entirely and only reveals it if a fatal error happens')
print('Regardless of the level, a fatal error will replace the existing panel contents')
sys.exit('Exceptions and sys.exit are treated as fatal errors. You better\n'
         'comment this out if you want to see anything else in this panel.')