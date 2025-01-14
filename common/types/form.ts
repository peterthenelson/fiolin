// Form inputs and layout used to get args from the user.
export interface FiolinForm {
  // The children (either layout or content) of the form
  children: FiolinFormComponent[];
  // The autofocused component (identified by name) if any
  autofocusedName?: string;
  // The autofocused component (identified by value) if any; only used to
  // distinguish between multiple components with the same name.
  autofocusedValue?: string;
}

// Union type of all the form components
export type FiolinFormComponent = (
  // The collection of component types
  FiolinFormDiv | FiolinFormLabel | FiolinFormCheckbox | FiolinFormColor |
  FiolinFormDate | FiolinFormDatetimeLocal | FiolinFormEmail | FiolinFormFile |
  FiolinFormNumber | FiolinFormRadio | FiolinFormRange | FiolinFormTel |
  FiolinFormText | FiolinFormTime | FiolinFormUrl | FiolinFormSelect |
  FiolinFormButton
);

// The type tags for components
export type FiolinFormComponentType = FiolinFormComponent extends { type: infer T } ? T : never;

// A div (to make a row or column of components).
export interface FiolinFormDiv {
  // Type id
  type: 'DIV';
  // Direction (as a flex-row-wrap or flex-col-wrap)
  dir: 'ROW' | 'COL';
  // The children in the row
  children: FiolinFormComponent[];
}

// A label (implicitly for whatever it's wrapping)
export interface FiolinFormLabel {
  // Type id
  type: 'LABEL';
  // The text of the label
  text: string;
  // The wrapped child component
  child: FiolinFormComponent;
}

// An input type="checkbox" element
export interface FiolinFormCheckbox {
  // Type id
  type: 'CHECKBOX';
  // The name of the arg to associate with this value
  name: string;
  // The (optional) value to associate with this checkbox
  value?: string;
  // Whether to begin with this box checked
  checked?: boolean;
}

// An input type="color" element
export interface FiolinFormColor {
  // Type id
  type: 'COLOR';
  // The name of the arg to associate with this value
  name: string;
  // The (optional) initial value
  value?: string;
}

// An input type="date" element
export interface FiolinFormDate {
  // Type id
  type: 'DATE';
  // The name of the arg to associate with this value
  name: string;
  // The (optional) default value to fill it with (YYYY-MM-DD)
  value?: string;
  // Is a (non-empty) value required?
  required?: boolean;
  // Minimum allowed value (YYYY-MM-DD)
  min?: string;
  // Maximum allowed value (YYYY-MM-DD)
  max?: string;
  // Step-size for selector (in number of days)
  step?: number;
}

// An input type="datetime-local" element
export interface FiolinFormDatetimeLocal {
  // Type id
  type: 'DATETIME_LOCAL';
  // The name of the arg to associate with this value
  name: string;
  // The (optional) default value to fill it with (YYYY-MM-DDTHH:mm)
  value?: string;
  // Is a (non-empty) value required?
  required?: boolean;
  // Minimum allowed value (YYYY-MM-DDTHH:mm)
  min?: string;
  // Maximum allowed value (YYYY-MM-DDTHH:mm)
  max?: string;
  // Step-size for selector (in number of seconds)
  step?: number;
}

// An input type="email" element
export interface FiolinFormEmail {
  // Type id
  type: 'EMAIL';
  // The name of the arg to associate with this value
  name: string;
  // The (optional) default value to fill it with
  value?: string;
  // Allow multiple emails (comma separated)
  multiple?: boolean;
  // The regex to validate against
  pattern?: string;
  // Is a (non-empty) value required?
  required?: boolean;
  // Placeholder to show if it's empty
  placeholder?: string;
  // The size in characters
  size?: number;
}

// An input type="file" element. Can optionally serve as a submit button too.
// Files end up in inputs and file names show up in the args given to the
// script (the paths are rewritten to be relative to pyodide filesystem).
export interface FiolinFormFile {
  // Type id
  type: 'FILE';
  // Optional name for this argument.
  name?: string;
  // Allow multiple files. Only makes sense if the script can accept >=1 files.
  // (And using this component at all only makes sense if )
  multiple?: boolean;
  // By default, inherits accept from the script's inputAccept, but it can be
  // optionally overridden on a per-file component basis.
  accept?: string;
  // Trigger form submission upon file choice.
  submit?: boolean;
}

// An input type="number" element
export interface FiolinFormNumber {
  // Type id
  type: 'NUMBER';
  // The name of the arg to associate with this value
  name: string;
  // The (optional) default value to fill it with
  value?: number;
  // Is a (non-empty) value required?
  required?: boolean;
  // Placeholder to show if it's empty
  placeholder?: string;
  // Minimum allowed value
  min?: number;
  // Maximum allowed value
  max?: number;
  // Step-size for selector
  step?: number;
}

// An input type="radio" element
export interface FiolinFormRadio {
  // Type id
  type: 'RADIO';
  // The name of the arg to associate with this value; radio buttons with the
  // same name are a mutually exclusive set of options.
  name: string;
  // The value to associate with this radio button
  value: string;
  // Whether to begin with this option selected
  checked?: boolean;
  // Is a selection of one of the radio buttons sharing this name required?
  required?: boolean;
}

// An input type="range" element
export interface FiolinFormRange {
  // Type id
  type: 'RANGE';
  // The name of the arg to associate with this value
  name: string;
  // The (optional) default value to fill it with
  value?: number;
  // Minimum allowed value
  min: number;
  // Maximum allowed value
  max: number;
  // Step-size for selector
  step?: number;
}

// An input type="tel" element
export interface FiolinFormTel {
  // Type id
  type: 'TEL';
  // The name of the arg to associate with this value
  name: string;
  // The (optional) default value to fill it with
  value?: string;
  // The regex to validate against
  pattern?: string;
  // Is a (non-empty) value required?
  required?: boolean;
  // Placeholder to show if it's empty
  placeholder?: string;
  // The size in characters
  size?: number;
}

// An input type="text" element
export interface FiolinFormText {
  // Type id
  type: 'TEXT';
  // The name of the arg to associate with this value
  name: string;
  // The (optional) default value to fill it with
  value?: string;
  // The regex to validate against
  pattern?: string;
  // Is a (non-empty) value required?
  required?: boolean;
  // Placeholder to show if it's empty
  placeholder?: string;
  // The size in characters
  size?: number;
}

// An input type="time" element
export interface FiolinFormTime {
  // Type id
  type: 'TIME';
  // The name of the arg to associate with this value
  name: string;
  // The (optional) default value to fill it with (HH:mm or HH:mm:ss)
  value?: string;
  // Is a (non-empty) value required?
  required?: boolean;
  // Minimum allowed value (HH:mm or HH:mm:ss)
  min?: string;
  // Maximum allowed value (HH:mm or HH:mm:ss)
  max?: string;
  // Step-size for selector (in number of seconds)
  step?: number;
}

// An input type="url" element
export interface FiolinFormUrl {
  // Type id
  type: 'URL';
  // The name of the arg to associate with this value
  name: string;
  // The (optional) default value to fill it with
  value?: string;
  // The regex to validate against
  pattern?: string;
  // Is a (non-empty) value required?
  required?: boolean;
  // Placeholder to show if it's empty
  placeholder?: string;
  // The size in characters
  size?: number;
}

// An select element
export interface FiolinFormSelect {
  // Type id
  type: 'SELECT';
  // The name of the arg to associate with this value
  name: string;
  // The options
  options: FiolinFormSelectOption[];
  // Can multiple options be selected?
  multiple?: boolean;
  // Is a non-empty choice required?
  required?: boolean;
}

// An option within a select
export interface FiolinFormSelectOption {
  // The text in the option component
  text: string;
  // The value to be submitted when it's selected (defaults to the text)
  value?: string;
  // Is this selected by default?
  selected?: boolean;
}

// A (submit) button element
export interface FiolinFormButton {
  // Type id
  type: 'BUTTON';
  // The text on the button
  text: string;
  // The name of the arg to associate with this value (optional unlike others)
  name?: string;
  // The value to be submitted when it's clicked (optional, but logically should
  // be present whenever name is present and vice versa).
  value?: string;
}
