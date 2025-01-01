# Fiolin Script Type Definitions

## FiolinForm

> Form inputs and layout used to get args from the user.

**children**: _FiolinFormComponent[]_

> The children (either layout or content) of the form

**autofocusedName?**: _string_

> The autofocused component (identified by name) if any

**hideFileChooser?**: _boolean_

> Hide the file chooser (and instead trigger off of a button). This option
only makes sense when inputFiles is NONE (otherwise your script will not
be runnable)

## FiolinFormComponent =

> Union type of all the form components

## FiolinFormDiv

> A div (to make a row or column of components).

**type**: _'DIV'_

> Type id

**dir**: _'ROW' | 'COL'_

> Direction (as a flex-row-wrap or flex-col-wrap)

**children**: _FiolinFormComponent[]_

> The children in the row

## FiolinFormLabel

> A label (implicitly for whatever it's wrapping)

**type**: _'LABEL'_

> Type id

**text**: _string_

> The text of the label

**child**: _FiolinFormComponent_

> The wrapped child component

## FiolinFormText

> An input type="text" element

**type**: _'TEXT'_

> Type id

**name**: _string_

> The name of the arg to associate with this value

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

> An button element

**type**: _'BUTTON'_

> Type id

**text**: _string_

> The text on the button

**name?**: _string_

> The name of the arg to associate with this value (optional unlike others)

**value?**: _string_

> The value to be submitted when it's clicked (optional, but logically should
be present whenever name is present and vice versa).

