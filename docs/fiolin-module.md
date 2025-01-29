# fiolin - Utility library for fiolin Scripts

## Description

Helpful fiolin-related python utilities.

## Functions

fiolin.**args**()

> Get the args dictionary.

fiolin.**continue_with**(new_state)

> Set the continue bit and save state for the next run.

fiolin.**cp**(src, dest)

> Copy a file from src to dest.

fiolin.**errno_to_str**(code)

> Translate an emscripten FS errno code to a symbolic name.

fiolin.**extract_exc**(e=None)

> Extract line number from (last) exception and format stack trace.

fiolin.**form_set_disabled**(name, value=None, disabled=True)

> Enqueue a form update to disable/enabled a given form component.

fiolin.**form_set_focus**(name, value=None)

> Enqueue a form update to focus a given form component.

fiolin.**form_set_hidden**(name, value=None, hidden=True)

> Enqueue a form update to hide/show a given form component.

fiolin.**form_set_value**(name, value)

> Enqueue a form update to change value for a given form component.

fiolin.**form_update**(name, partial, value=None)

> Enqueue a form update to change arbitrary attributes of a form component.
> 
> Note: The 'type' field is required!

fiolin.**get_canvas**(name)

> Get the named canvas object, if any.
> 
> May be missing even if a corresponding CANVAS exists in the form, e.g., if
> this is running offline.

fiolin.**get_input_basename**(suffix='', ext=None)

> Gets the (assumed to be single) input file basename.
> 
> Optionally adds a suffix or swaps the extension, which is helpful for making
> output file names.

fiolin.**get_input_basenames**()

> Gets the input file basenames.

fiolin.**get_input_path**()

> Gets the (assumed to be single) input file path.

fiolin.**get_input_paths**()

> Gets the input file paths.

fiolin.**set_output_basename**(output)

> Manually sets the output file.

fiolin.**set_output_basenames**(outputs=None)

> Sets the outputs; if not specified, adds all matching /output/*.

fiolin.**smart_sort**(files)

> Sorts file names in the intuitive order, accounting for sloppy numbering.

fiolin.**state**()

> Get saved state from the previous run.

fiolin.**tree**(path, file=<_io.TextIOWrapper name='<stdout>' mode='w' encoding='utf-8'>, prefix=None)

> Like the tree command-line utility; helpful for debugging.

## Classes

class fiolin.**Errno**

> Mapping between symbolic and numeric versions of WASM FS errors.

Errno.**E2BIG** = 1

Errno.**EACCES** = 2

Errno.**EADDRINUSE** = 3

Errno.**EADDRNOTAVAIL** = 4

Errno.**EADV** = 122

Errno.**EAFNOSUPPORT** = 5

Errno.**EAGAIN** = 6

Errno.**EALREADY** = 7

Errno.**EBADE** = 113

Errno.**EBADF** = 8

Errno.**EBADFD** = 127

Errno.**EBADMSG** = 9

Errno.**EBADR** = 114

Errno.**EBADRQC** = 103

Errno.**EBADSLT** = 102

Errno.**EBFONT** = 101

Errno.**EBUSY** = 10

Errno.**ECANCELED** = 11

Errno.**ECHILD** = 12

Errno.**ECHRNG** = 106

Errno.**ECOMM** = 124

Errno.**ECONNABORTED** = 13

Errno.**ECONNREFUSED** = 14

Errno.**ECONNRESET** = 15

Errno.**EDEADLK** = 16

Errno.**EDESTADDRREQ** = 17

Errno.**EDOM** = 18

Errno.**EDOTDOT** = 125

Errno.**EDQUOT** = 19

Errno.**EEXIST** = 20

Errno.**EFAULT** = 21

Errno.**EFBIG** = 22

Errno.**EHOSTDOWN** = 142

Errno.**EHOSTUNREACH** = 23

Errno.**EIDRM** = 24

Errno.**EILSEQ** = 25

Errno.**EINPROGRESS** = 26

Errno.**EINTR** = 27

Errno.**EINVAL** = 28

Errno.**EIO** = 29

Errno.**EISCONN** = 30

Errno.**EISDIR** = 31

Errno.**EL2HLT** = 112

Errno.**EL2NSYNC** = 156

Errno.**EL3HLT** = 107

Errno.**EL3RST** = 108

Errno.**ELIBACC** = 129

Errno.**ELIBBAD** = 130

Errno.**ELIBEXEC** = 133

Errno.**ELIBMAX** = 132

Errno.**ELIBSCN** = 131

Errno.**ELNRNG** = 109

Errno.**ELOOP** = 32

Errno.**EMFILE** = 33

Errno.**EMLINK** = 34

Errno.**EMSGSIZE** = 35

Errno.**EMULTIHOP** = 36

Errno.**ENAMETOOLONG** = 37

Errno.**ENETDOWN** = 38

Errno.**ENETRESET** = 39

Errno.**ENETUNREACH** = 40

Errno.**ENFILE** = 41

Errno.**ENOANO** = 104

Errno.**ENOBUFS** = 42

Errno.**ENOCSI** = 111

Errno.**ENODATA** = 116

Errno.**ENODEV** = 43

Errno.**ENOENT** = 44

Errno.**ENOEXEC** = 45

Errno.**ENOLCK** = 46

Errno.**ENOLINK** = 47

Errno.**ENOMEDIUM** = 148

Errno.**ENOMEM** = 48

Errno.**ENOMSG** = 49

Errno.**ENONET** = 119

Errno.**ENOPKG** = 120

Errno.**ENOPROTOOPT** = 50

Errno.**ENOSPC** = 51

Errno.**ENOSR** = 118

Errno.**ENOSTR** = 100

Errno.**ENOSYS** = 52

Errno.**ENOTBLK** = 105

Errno.**ENOTCONN** = 53

Errno.**ENOTDIR** = 54

Errno.**ENOTEMPTY** = 55

Errno.**ENOTRECOVERABLE** = 56

Errno.**ENOTSOCK** = 57

Errno.**ENOTTY** = 59

Errno.**ENOTUNIQ** = 126

Errno.**ENXIO** = 60

Errno.**EOPNOTSUPP** = 138

Errno.**EOVERFLOW** = 61

Errno.**EOWNERDEAD** = 62

Errno.**EPERM** = 63

Errno.**EPFNOSUPPORT** = 139

Errno.**EPIPE** = 64

Errno.**EPROTO** = 65

Errno.**EPROTONOSUPPORT** = 66

Errno.**EPROTOTYPE** = 67

Errno.**ERANGE** = 68

Errno.**EREMCHG** = 128

Errno.**EREMOTE** = 121

Errno.**EROFS** = 69

Errno.**ESHUTDOWN** = 140

Errno.**ESOCKTNOSUPPORT** = 137

Errno.**ESPIPE** = 70

Errno.**ESRCH** = 71

Errno.**ESRMNT** = 123

Errno.**ESTALE** = 72

Errno.**ESTRPIPE** = 135

Errno.**ETIME** = 117

Errno.**ETIMEDOUT** = 73

Errno.**ETOOMANYREFS** = 141

Errno.**ETXTBSY** = 74

Errno.**EUNATCH** = 110

Errno.**EUSERS** = 136

Errno.**EXDEV** = 75

Errno.**EXFULL** = 115

