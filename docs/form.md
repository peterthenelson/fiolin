# Fiolin Script Type Definitions

## FiolinForm

> Form inputs and layout used to get args from the user.

**children**: _FiolinFormComponent[]_

> The children (either layout or content) of the form

**autofocusedName?**: _string_

> The autofocused component (identified by name) if any

**autofocusedValue?**: _string_

> The autofocused component (identified by value) if any; only used to
distinguish between multiple components with the same name.

## FiolinFormComponent =

> Union type of all the form components

## FiolinFormComponentType =

> The type tags for components

## FiolinFormDiv

> A div (to make a row or column of components).

**type**: _'DIV'_

> Type id

**name?**: _string_

> Optional name. Does not affect form submission, but is needed for
interactive for updates.

**dir**: _'ROW' | 'COL'_

> Direction (as a flex-row-wrap or flex-col-wrap)

**children**: _FiolinFormComponent[]_

> The children in the row

## FiolinFormLabel

> A label (implicitly for whatever it's wrapping)

**type**: _'LABEL'_

> Type id

**name?**: _string_

> Optional name. Does not affect form submission, but is needed for
interactive for updates.

**text**: _string_

> The text of the label

**child**: _FiolinFormComponent_

> The wrapped child component

## FiolinFormCheckbox

> An input type="checkbox" element

**type**: _'CHECKBOX'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**value?**: _string_

> The (optional) value to associate with this checkbox

**checked?**: _boolean_

> Whether to begin with this box checked

## FiolinFormColor

> An input type="color" element

**type**: _'COLOR'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**value?**: _string_

> The (optional) initial value

## FiolinFormDate

> An input type="date" element

**type**: _'DATE'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**value?**: _string_

> The (optional) default value to fill it with (YYYY-MM-DD)

**required?**: _boolean_

> Is a (non-empty) value required?

**min?**: _string_

> Minimum allowed value (YYYY-MM-DD)

**max?**: _string_

> Maximum allowed value (YYYY-MM-DD)

**step?**: _number_

> Step-size for selector (in number of days)

## FiolinFormDatetimeLocal

> An input type="datetime-local" element

**type**: _'DATETIME_LOCAL'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**value?**: _string_

> The (optional) default value to fill it with (YYYY-MM-DDTHH:mm)

**required?**: _boolean_

> Is a (non-empty) value required?

**min?**: _string_

> Minimum allowed value (YYYY-MM-DDTHH:mm)

**max?**: _string_

> Maximum allowed value (YYYY-MM-DDTHH:mm)

**step?**: _number_

> Step-size for selector (in number of seconds)

## FiolinFormEmail

> An input type="email" element

**type**: _'EMAIL'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**value?**: _string_

> The (optional) default value to fill it with

**multiple?**: _boolean_

> Allow multiple emails (comma separated)

**pattern?**: _string_

> The regex to validate against

**required?**: _boolean_

> Is a (non-empty) value required?

**placeholder?**: _string_

> Placeholder to show if it's empty

**size?**: _number_

> The size in characters

## FiolinFormFile

> An input type="file" element. Can optionally serve as a submit button too.
Files end up in inputs and file names show up in the args given to the
script (the paths are rewritten to be relative to pyodide filesystem).

**type**: _'FILE'_

> Type id

**name?**: _string_

> Optional name for this argument.

**multiple?**: _boolean_

> Allow multiple files. Only makes sense if the script can accept >=1 files.
(And using this component at all only makes sense if )

**accept?**: _string_

> By default, inherits accept from the script's inputAccept, but it can be
optionally overridden on a per-file component basis.

**submit?**: _boolean_

> Trigger form submission upon file choice.

## FiolinFormNumber

> An input type="number" element

**type**: _'NUMBER'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**value?**: _number_

> The (optional) default value to fill it with

**required?**: _boolean_

> Is a (non-empty) value required?

**placeholder?**: _string_

> Placeholder to show if it's empty

**min?**: _number_

> Minimum allowed value

**max?**: _number_

> Maximum allowed value

**step?**: _number_

> Step-size for selector

## FiolinFormRadio

> An input type="radio" element

**type**: _'RADIO'_

> Type id

**name**: _string_

> The name of the arg to associate with this value; radio buttons with the
same name are a mutually exclusive set of options.

**value**: _string_

> The value to associate with this radio button

**checked?**: _boolean_

> Whether to begin with this option selected

**required?**: _boolean_

> Is a selection of one of the radio buttons sharing this name required?

## FiolinFormRange

> An input type="range" element

**type**: _'RANGE'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**value?**: _number_

> The (optional) default value to fill it with

**min**: _number_

> Minimum allowed value

**max**: _number_

> Maximum allowed value

**step?**: _number_

> Step-size for selector

## FiolinFormTel

> An input type="tel" element

**type**: _'TEL'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**value?**: _string_

> The (optional) default value to fill it with

**pattern?**: _string_

> The regex to validate against

**required?**: _boolean_

> Is a (non-empty) value required?

**placeholder?**: _string_

> Placeholder to show if it's empty

**size?**: _number_

> The size in characters

## FiolinFormText

> An input type="text" element

**type**: _'TEXT'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**value?**: _string_

> The (optional) default value to fill it with

**pattern?**: _string_

> The regex to validate against

**required?**: _boolean_

> Is a (non-empty) value required?

**placeholder?**: _string_

> Placeholder to show if it's empty

**size?**: _number_

> The size in characters

## FiolinFormTime

> An input type="time" element

**type**: _'TIME'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**value?**: _string_

> The (optional) default value to fill it with (HH:mm or HH:mm:ss)

**required?**: _boolean_

> Is a (non-empty) value required?

**min?**: _string_

> Minimum allowed value (HH:mm or HH:mm:ss)

**max?**: _string_

> Maximum allowed value (HH:mm or HH:mm:ss)

**step?**: _number_

> Step-size for selector (in number of seconds)

## FiolinFormUrl

> An input type="url" element

**type**: _'URL'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**value?**: _string_

> The (optional) default value to fill it with

**pattern?**: _string_

> The regex to validate against

**required?**: _boolean_

> Is a (non-empty) value required?

**placeholder?**: _string_

> Placeholder to show if it's empty

**size?**: _number_

> The size in characters

## FiolinFormSelect

> An select element

**type**: _'SELECT'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

**options**: _FiolinFormSelectOption[]_

> The options

**multiple?**: _boolean_

> Can multiple options be selected?

**required?**: _boolean_

> Is a non-empty choice required?

## FiolinFormSelectOption

> An option within a select

**text**: _string_

> The text in the option component

**value?**: _string_

> The value to be submitted when it's selected (defaults to the text)

**selected?**: _boolean_

> Is this selected by default?

## FiolinFormButton

> A (submit) button element

**type**: _'BUTTON'_

> Type id

**text**: _string_

> The text on the button

**name?**: _string_

> The name of the arg to associate with this value (optional unlike others)

**value?**: _string_

> The value to be submitted when it's clicked (optional, but logically should
be present whenever name is present and vice versa).

