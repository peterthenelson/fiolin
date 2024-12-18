"""Handling zero, one, or multiple input files."""
import fiolin

# TODO: This currently will always print one file. Change over the Yaml tab, and
# change the inputFiles option. Valid options are: NONE, SINGLE, MULTI, ANY. See
# how those affect the behavior of the UI and what shows up here.
fiolin.tree('/input')
