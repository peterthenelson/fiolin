# Third Party Script FAQ

### What's a third-party script? <a name="what"></a>

Fiolin is a platform for running various scripts that perform different tasks.
For example: combining PDFs, unpacking zip files, rotating images, etc.  Some of
these scripts were written by the developers of the Fiolin website (i.e.,
first-party scripts). Other scripts were written by software developers
unaffiliated with the Fiolin website (i.e., third-party scripts).

### Why do I have to approve third-party scripts? <a name="approval"></a>

Third-party developers do not need approval from the Fiolin developers to write
and share their scripts. Since the Fiolin developers do not vet these scripts,
we cannot endorse any third-party script as being useful or safe. Use at your
own risk.

### Can third-party developers see my files? <a name="sharing"></a>

No. Just like with first-party scripts, your files don't leave your browser.
They do control the code that generates the _output_ files though.

### What other risks are there? <a name="risks"></a>

Fiolin cannot guarantee that third-party scripts work as advertised. Output
files may or may not have the properties they say they do. To give a silly but
suggestive example, a third-party script could claim to convert pngs to jpgs but
actually just ignore the input file and output a picture of Rick Astley.

To minimize these sorts of risks, Fiolin does not allow third-party scripts to
generate certain risky file types (e.g., exe files). If a third-party script
instructs you to change the file extension of an output file, don't do it!

### How can I tell if a script is third-party? <a name="link-format"></a>

Links to third-party scripts look like this:
_fiolin.org/third-party?gh=some-user/some-repo/some-script_. Links to scripts
written by the Fiolin developers look like this:
_fiolin.org/s/some-script_. Also, third-party scripts always display the github
profile picture of the script author and have links to their github page.

### Who can write a third-party script? <a name="who"></a>

Anyone with a github account can write a third-party script. If you want to find
out who wrote a particular script, you can click on the author's github profile
picture or their username.

### I'm a developer. How do I write third-party scripts? <a name="dev"></a>

See the [developer documentation](./index.md).
