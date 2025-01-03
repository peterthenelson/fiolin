import { ObjPath, pArr, pBool, pNum, pObj, pObjWithProps, pOpt, pStr, pStrLit, pStrUnion, pTaggedUnion } from './parse';
import { FiolinForm, FiolinFormButton, FiolinFormDiv, FiolinFormComponent, FiolinFormText, FiolinFormLabel, FiolinFormSelect, FiolinFormSelectOption, FiolinFormCheckbox, FiolinFormColor, FiolinFormDate, FiolinFormDatetimeLocal, FiolinFormNumber  } from './types/form';

export const pForm = pObjWithProps<FiolinForm>({
  children: pArr(pComponent),
  autofocusedName: pOpt(pStr),
  autofocusedValue: pOpt(pStr),
  hideFileChooser: pOpt(pBool),
});

function pComponent(p: ObjPath, v: unknown): FiolinFormComponent {
  return pTaggedUnion<FiolinFormComponent>({
    'DIV': pDiv,
    'LABEL': pLabel,
    'CHECKBOX': pCheckbox,
    'COLOR': pColor,
    'DATE': pDate,
    'DATETIME_LOCAL': pDatetimeLocal,
    'NUMBER': pNumber,
    'TEXT': pText,
    'SELECT': pSelect,
    'BUTTON': pButton,
  })(p, v);
}

const pDir = pStrUnion<('ROW' | 'COL')[]>(['ROW', 'COL']);

const pDiv = pObjWithProps<FiolinFormDiv>({
  type: pStrLit('DIV'),
  dir: pDir,
  children: pArr(pComponent),
});

const pLabel = pObjWithProps<FiolinFormLabel>({
  type: pStrLit('LABEL'),
  text: pStr,
  child: pComponent,
});

const pCheckbox = pObjWithProps<FiolinFormCheckbox>({
  type: pStrLit('CHECKBOX'),
  name: pStr,
  value: pOpt(pStr),
  checked: pOpt(pBool),
});

const pColor = pObjWithProps<FiolinFormColor>({
  type: pStrLit('COLOR'),
  name: pStr,
  value: pOpt(pStr),
});

const pDate = pObjWithProps<FiolinFormDate>({
  type: pStrLit('DATE'),
  name: pStr,
  value: pOpt(pStr),
  required: pOpt(pBool),
  min: pOpt(pStr),
  max: pOpt(pStr),
  step: pOpt(pNum),
});

const pDatetimeLocal = pObjWithProps<FiolinFormDatetimeLocal>({
  type: pStrLit('DATETIME_LOCAL'),
  name: pStr,
  value: pOpt(pStr),
  required: pOpt(pBool),
  min: pOpt(pStr),
  max: pOpt(pStr),
  step: pOpt(pNum),
});

const pNumber = pObjWithProps<FiolinFormNumber>({
  type: pStrLit('NUMBER'),
  name: pStr,
  value: pOpt(pNum),
  required: pOpt(pBool),
  placeholder: pOpt(pStr),
  min: pOpt(pNum),
  max: pOpt(pNum),
  step: pOpt(pNum),
});

const pText = pObjWithProps<FiolinFormText>({
  type: pStrLit('TEXT'),
  name: pStr,
  value: pOpt(pStr),
  pattern: pOpt(pStr),
  required: pOpt(pBool),
  placeholder: pOpt(pStr),
  size: pOpt(pNum),
});

const pSelectOption = pObjWithProps<FiolinFormSelectOption>({
  text: pStr,
  value: pOpt(pStr),
  selected: pOpt(pBool),
});

const pSelect = pObjWithProps<FiolinFormSelect>({
  type: pStrLit('SELECT'),
  name: pStr,
  options: pArr(pSelectOption),
  multiple: pOpt(pBool),
  required: pOpt(pBool),
});

const pButton = pObjWithProps<FiolinFormButton>({
  type: pStrLit('BUTTON'),
  text: pStr,
  name: pOpt(pStr),
  value: pOpt(pStr),
});
