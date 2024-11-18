# Fiolin Developer Documentation

_A Fiddle For Files_

**tl;dr:** Write simple scripts that manipulate files. Share them with your
friends. Run them locally in your browser.

## Guide

Think about Fiolin as a JSFiddle-like platform for writing and sharing simple
scripts, with a focus on transforming files provided by the user of the script.
If you just want to dive right in, check out the
[interactive playground](/playground), which includes some helpful examples to
get you started.

* [Python API](#python-api)
* [Third-Party Packages](#third-party-packages)
* [Sharing Fiolin Scripts](#sharing-fiolin-scripts)
* [Advanced UI Configuration](#advance-ui-configuration)
* [Design Document](/doc/design)
* [Example First-Party Fiolin Scripts][examples]

## Python API <a name="python-api"></a>

Fiolin scripts are just vanilla python, run in the browser using
[pyodide](https://pyodide.org). Interacting with the outside world takes place
via the `fiolin` module and the (in-memory) file system. Here's a simple example
copying a file from input to output:

```py
import fiolin

# If the user uploads a file named foo.txt, this will be 'foo.txt'
name = fiolin.get_input_basename()

# That input will be mounted to /input/foo.txt
with open(f'/input/{name}') as infile:
  # Outputs are written to the /output directory
  with open(f'/output/foo-{name}', 'wb') as outfile:
    outfile.write(infile.read())

# This common task can be done using fiolin.cp
fiolin.cp(f'/input/{name}', f'/output/bar-{name}')

# You can also put files in /tmp. They will not be persisted between runs of the
# script.
fiolin.cp(f'/input/{name}', f'/tmp/baz-{name}')

# You can manually set which output files will be exposed:
# fiolin.set_output_basename(f'/output/foo-{name}')
# fiolin.set_output_basenames([f'/output/foo-{name}', f'/output/bar-{name}'])
# However, the default behavior is to automatically export any files matching
# /output/*, so it's usually not necessary to use these functions.
```

For more information on the `fiolin` module, read [the pydoc](/doc/fiolin-module).

## Third-Party Packages <a name="third-party-packages"></a>

Fiolin supports installing packages from PyPI, so long as they are written in
pure python. If you are unsure about whether the package you're interested in
using will work, visit [PyPI](https://pypi.org), find your package, look at the
"Download Files" section, and see if there's a file ending in
`py3-none-any.whl`. If so, you're good.

In order to use a package, you need to explicitly list it in the runtime section
of your Fiolin script json:

```json
{
  // ...
  "runtime": {
    "pyPkgs": [{ "type": "PYPI", "name": "mypkg" }]
  }
  // ...
}
```

TODO: Adding WASM stuff

# Sharing Fiolin Scripts <a name="sharing-fiolin-scripts"></a>

You have two options for distributing your Fiolin scripts: host them on github
pages, or contribute them to the Fiolin repository.

1. The first option is very easy. The playground should have a button that
   generates a json file for you, along with the instructions for what to do
   with it:

   ```sh
   # TODO: Write a script that creates a repo and uploads stuff to gh pages
   ```

   You're welcome to manage your json files manually too. Fiolin just expects
   a valid json file conforming to the `FiolinScript` type
   (see [here](/doc/fiolin-script)) hosted on a github.io page.
   
   The advantage of this method is that it's easy, and you're in control. Click
   a button, run a script, send your friend a link, and they can start using
   your script immediately. Want to change it? Edit the file, rerun the script,
   and you're done. The downside is that the user experience of running
   so-called third-party scripts is higher friction. The user is asked whether
   they trust the script developer (as identified by their github avatar and
   username) before they can run it. If your script seems of general interest,
   you might considering making it a first-party script.

2. The second option is to send me a pull request to incorporate it into the
   repository of first-party scripts. Before doing so, you should get your
   script working as a third-party script first, add some tests, and write a
   description that a non-technical user would find easy to read. Please be
   careful to use testdata that is free from personal information and is
   compatible with the MIT open-source license.

# Advanced UI Configuration <a name="advance-ui-configuration"></a>

You may have noticed that different Fiolin scripts have different interfaces.
Some have just one "Choose An Input File" control that automatically triggers
the script to run and download the (single) output file. Others have more
complex file-chooser components, manual run buttons, etc.

The `interface` section of the `FiolinScript` type is used to configure this
behavior. The basic options are for how many input and output files you expect.
`'NONE'` means no files, `'SINGLE'` means exactly one file, and `'MULTI'` means
any number of files.

TODO: Update once there are more interesting options

If you're curious about configuration options you don't see covered in the docs,
take a look at the [types](/doc/fiolin-script) to learn more.

[examples]: https://github.com/peterthenelson/fiolin/blob/main/fiols/