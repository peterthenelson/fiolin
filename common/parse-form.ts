import { ObjPath, pArr, pBool, pNum, pObjWithProps, pOpt, pStr, pStrLit, pStrUnion, pTaggedUnion } from './parse';
import { FiolinForm, FiolinFormButton, FiolinFormDiv, FiolinFormComponent, FiolinFormText, FiolinFormLabel, FiolinFormSelect, FiolinFormSelectOption, FiolinFormCheckbox, FiolinFormColor, FiolinFormDate, FiolinFormDatetimeLocal, FiolinFormNumber, FiolinFormEmail, FiolinFormRadio, FiolinFormRange, FiolinFormTel, FiolinFormUrl, FiolinFormTime, FiolinFormFile  } from './types/form';

export const pForm = pObjWithProps<FiolinForm>({
  children: pArr(pComponent),
  autofocusedName: pOpt(pStr),
  autofocusedValue: pOpt(pStr),
});

function pComponent(p: ObjPath, v: unknown): FiolinFormComponent {
  return pTaggedUnion<FiolinFormComponent>({
    'DIV': pDiv,
    'LABEL': pLabel,
    'CHECKBOX': pCheckbox,
    'COLOR': pColor,
    'DATE': pDate,
    'DATETIME_LOCAL': pDatetimeLocal,
    'EMAIL': pEmail,
    'FILE': pFile,
    'NUMBER': pNumber,
    'RADIO': pRadio,
    'RANGE': pRange,
    'TEL': pTel,
    'TIME': pTime,
    'TEXT': pText,
    'URL': pUrl,
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

const pEmail = pObjWithProps<FiolinFormEmail>({
  type: pStrLit('EMAIL'),
  name: pStr,
  value: pOpt(pStr),
  multiple: pOpt(pBool),
  pattern: pOpt(pStr),
  required: pOpt(pBool),
  placeholder: pOpt(pStr),
  size: pOpt(pNum),
});

const pFile = pObjWithProps<FiolinFormFile>({
  type: pStrLit('FILE'),
  name: pOpt(pStr),
  multiple: pOpt(pBool),
  accept: pOpt(pStr),
  submit: pOpt(pBool),
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

const pRadio = pObjWithProps<FiolinFormRadio>({
  type: pStrLit('RADIO'),
  name: pStr,
  value: pStr,
  checked: pOpt(pBool),
  required: pOpt(pBool),
});

const pRange = pObjWithProps<FiolinFormRange>({
  type: pStrLit('RANGE'),
  name: pStr,
  value: pOpt(pNum),
  min: pNum,
  max: pNum,
  step: pOpt(pNum),
});

const pTel = pObjWithProps<FiolinFormTel>({
  type: pStrLit('TEL'),
  name: pStr,
  value: pOpt(pStr),
  pattern: pOpt(pStr),
  required: pOpt(pBool),
  placeholder: pOpt(pStr),
  size: pOpt(pNum),
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

const pTime = pObjWithProps<FiolinFormTime>({
  type: pStrLit('TIME'),
  name: pStr,
  value: pOpt(pStr),
  required: pOpt(pBool),
  min: pOpt(pStr),
  max: pOpt(pStr),
  step: pOpt(pNum),
});

const pUrl = pObjWithProps<FiolinFormUrl>({
  type: pStrLit('URL'),
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
