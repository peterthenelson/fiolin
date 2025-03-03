# <a href="/" class="plain-link">ƒ<span class="home-io">ɪᴏ</span>ʟɪɴ</a> -- Developer Docs

_A Fiddle For Files_

**tl;dr:** Write simple scripts that manipulate files. Share them with your
friends. Run them entirely in your browser.

## Guide

Think about Fiolin as a JSFiddle-like platform for writing and sharing simple
scripts, with a focus on transforming files provided by the user of the script.
Check out the [interactive tutorial][playground] to get started writing fiolin
scripts in your browser, or copy the [template repository][fiolin-tmpl] and
use the node-based offline toolchain.

## Table of Contents

* [Python API](#python-api)
* [Importing Libraries](#importing-libs)
  * [Built-in Libraries and Packages](#builtin-libs)
  * [Third-Party Packages](#third-party-packages)
  * [WASM Modules](#wasm)
* [UI Configuration](#ui-configuration)
  * [Basic UI](#basic-ui)
  * [Forms](#forms)
* [Sharing Fiolin Scripts](#sharing-fiolin-scripts)
  * [Linking To 3p Scripts](#linking-3p-scripts)
* [Further Reading](#more)
  * [Design Document](./design.md)
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

For more information on the `fiolin` module, read [the pydoc](./fiolin-module.md)
or follow the [interactive tutorial][playground].

## Importing Libraries <a name="importing-libs"></a>

### Built-in Libraries and Packages <a name="builtin-libs"></a>

You can of course import any of the standard python modules. Additionally,
pyodide ships with a number of [popular third-party libraries built right in.][pyodide-builtin]

### Third-Party Packages <a name="third-party-packages"></a>

Fiolin supports installing packages from PyPI, so long as they are written in
pure python. If you are unsure about whether the package you're interested in
using will work, visit [PyPI](https://pypi.org), find your package, look at the
"Download Files" section, and see if there's a file ending in
`py3-none-any.whl`. If so, you're good.

In order to use a package, you need to explicitly list it in the runtime section
of your Fiolin script yaml:

```yml
# ...
runtime:
  pythonPkgs:
    - type: PYPI
      name: mypkg
```

### WASM Modules <a name="wasm"></a>

You can configure fiolin to install some pre-selected WASM modules. This
currently is limited to imagemagick, although there are some issues around
js/py interop that may need to be ironed out. See
https://github.com/dlemstra/magick-wasm for details on how the js api works.

Note that the python file-system is mounted under `/py` in the imagemagick
file-system.

In order to use imagemagick (or any future additional wasm modules), you must
explicitly list it in the runtime section of your Fiolin script yaml:

```yml
# ...
runtime:
  wasmModules:
    - name: imagemagick
```

## UI Configuration <a name="ui-configuration"></a>

You may have noticed that different Fiolin scripts have different interfaces.
Some have just one "Choose An Input File" control that automatically triggers
the script to run and download the (single) output file. Others have file
choosers with different behavior or custom inputs.

The `interface` section of the `FiolinScript` type is used to configure this
behavior.

### Basic UI <a name="basic-ui"></a>

The basic options are for how many input and output files you expect.  `'NONE'`
means no files, `'SINGLE'` means exactly one file, `'MULTI'` means more than one
file, and `'ANY'` means any number of files.

Additionally, `inputAccept` will configure the file chooser to only suggest
files of a particular type. (See [MDN][mdn-input-accept] for details.)

### Forms <a name="forms"></a>

Fiolin scripts can be configured to present basic HTML forms to the user, and
the submitted values will be made available to the running script.

An example (see [here](./form.md) for more details):

```yml
# ...
interface:
  # ...
  form:
    children:
      - type: RADIO
        name: currency
        value: dollars
      - type: RADIO
        name: currency
        value: rubles
      - type: RANGE
        name: price
        min: 0
        max: 100
```

```py
import fiolin
args = fiolin.args()
print(f'You guessed the price was {args['price']} {args['currency']}')
```

If you're curious about configuration options you don't see covered in the docs,
take a look at the types for [scripts](./fiolin-script.md).

## Sharing Fiolin Scripts <a name="sharing-fiolin-scripts"></a>

You have two options for distributing your Fiolin scripts: upload them to github
pages (and run them on the production fiolin site!), or contribute them to the
Fiolin repository.

1. The first option is easy. The playground has a deploy button that generates
   a shell script. Run it. Congratulations, you now have a fiolin script in your
   (new or updated) github repository. The script will also give you a link you
   can share with your friends to run your script on the production fiolin site.
   Once you have a github repository, you have the option of using the included
   tools to develop, test, and deploy your scripts without an in-browser editor
   and one-off shell scripts.
   
   The advantage of this method is that it's easy, and you're in control. Click
   a button, run a script, send your friend a link, and they can start using
   your script immediately. Want to change it? Either click the button and run
   another shell script, or update your repository with git and npm commands.
   The only downside is that the user experience of running third-party scripts
   is higher friction. The user is asked whether they trust the script developer
   (as identified by their github avatar and username) before they can run it.
   If your script seems of general interest, you might considering making it a
   first-party script.

2. The second option is to send me a pull request to incorporate it into the
   repository of first-party scripts. Before doing so, you should get your
   script working as a third-party script first, add some tests, and write a
   description that a non-technical user would find easy to read. Please be
   careful to use testdata that is free from personal information and is
   compatible with the MIT open-source license.

### Linking To 3p Scripts <a name="linking-3p-scripts"></a>

<form id="form-3p" action="/third-party/" method="GET">
  <div class="flex-row-wrap">
    <label>
      Github information
      <input
        type="text" name="gh" required
        pattern="^[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+/[a-z0-9_\-]+$"
        placeholder="username/repo/script-id"
      />
    </label>
  </div>
  <div class="flex-row-wrap">
    <button type="submit">Run 3p Script</button>
  </div>
</form>

## Further Reading <a name="more"></a>

* [Design Document](./design.md)
* [Example First-Party Fiolin Scripts][examples]

[examples]: https://github.com/peterthenelson/fiolin/blob/main/fiols/
[fiolin-tmpl]: https://github.com/peterthenelson/fiolin-template
[mdn-input-accept]: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept#unique_file_type_specifiers
[playground]: https://fiolin.org/playground
[pyodide-builtin]: https://pyodide.org/en/stable/usage/packages-in-pyodide.html