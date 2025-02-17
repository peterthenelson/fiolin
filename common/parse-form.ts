import { ObjPath, pArr, Parser, pBool, pNum, pObjWithProps, pOpt, pStr, pStrLit, pStrUnion, pTaggedUnion, pTypedPartialWithProps } from './parse';
import { TypedPartial } from './tagged-unions';
import { FiolinForm, FiolinFormButton, FiolinFormDiv, FiolinFormComponent, FiolinFormText, FiolinFormLabel, FiolinFormSelect, FiolinFormSelectOption, FiolinFormCheckbox, FiolinFormColor, FiolinFormDate, FiolinFormDatetimeLocal, FiolinFormNumber, FiolinFormEmail, FiolinFormRadio, FiolinFormRange, FiolinFormTel, FiolinFormUrl, FiolinFormTime, FiolinFormFile, FiolinFormComponentId, FiolinFormOutput, FiolinFormComponentType, FiolinFormCanvas  } from './types/form';

export const pForm = pObjWithProps<FiolinForm>({
  children: pArr(pFiolinFormComponent),
  autofocusedName: pOpt(pStr),
  autofocusedValue: pOpt(pStr),
});

export function pFiolinFormComponent(p: ObjPath, v: unknown): FiolinFormComponent {
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
    'OUTPUT': pOutput,
    'CANVAS': pCanvas,
  })(p, v);
}

export function pPartialFiolinFormComponent(p: ObjPath, v: unknown): TypedPartial<FiolinFormComponentType, FiolinFormComponent> {
  return pTaggedUnion<TypedPartial<FiolinFormComponentType, FiolinFormComponent>>({
    'DIV': pPartialDiv,
    'LABEL': pPartialLabel,
    'CHECKBOX': pPartialCheckbox,
    'COLOR': pPartialColor,
    'DATE': pPartialDate,
    'DATETIME_LOCAL': pPartialDatetimeLocal,
    'EMAIL': pPartialEmail,
    'FILE': pPartialFile,
    'NUMBER': pPartialNumber,
    'RADIO': pPartialRadio,
    'RANGE': pPartialRange,
    'TEL': pPartialTel,
    'TIME': pPartialTime,
    'TEXT': pPartialText,
    'URL': pPartialUrl,
    'SELECT': pPartialSelect,
    'BUTTON': pPartialButton,
    'OUTPUT': pPartialOutput,
    'CANVAS': pPartialCanvas,
  })(p, v);
}

export const pFiolinFormComponentId = pObjWithProps<FiolinFormComponentId>({
  name: pStr,
  value: pOpt(pStr),
});

function pObjAndPartial<T extends string, U extends { type: T }>(props: { [K in keyof Required<U>]: Parser<U[K]> }): [Parser<U>, Parser<Partial<U> & { type: T }>] {
  const obj: Parser<U> = pObjWithProps(props);
  const partial: Parser<Partial<U> & { type: T }> = pTypedPartialWithProps<T, U>(props);
  return [obj, partial];
}

const pDir = pStrUnion<('ROW' | 'COL')[]>(['ROW', 'COL']);

const pCommonAttrs = {
  hidden: pOpt(pBool),
  onpointerdown: pOpt(pBool),
  onpointerup: pOpt(pBool),
  onpointermove: pOpt(pBool),
  onpointerover: pOpt(pBool),
  onpointerout: pOpt(pBool),
  onpointerenter: pOpt(pBool),
  onpointerleave: pOpt(pBool),
  onpointercancel: pOpt(pBool),
  ongotpointercapture: pOpt(pBool),
  onlostpointercapture: pOpt(pBool),
  onclick: pOpt(pBool),
}

const pCommonInputAttrs = {
  disabled: pOpt(pBool),
  oninput: pOpt(pBool),
  onchange: pOpt(pBool),
}

const [pDiv, pPartialDiv] = pObjAndPartial<FiolinFormComponentType, FiolinFormDiv>({
  type: pStrLit('DIV'),
  name: pOpt(pStr),
  dir: pDir,
  children: pArr(pFiolinFormComponent),
  ...pCommonAttrs,
});

const [pLabel, pPartialLabel] = pObjAndPartial<FiolinFormComponentType, FiolinFormLabel>({
  type: pStrLit('LABEL'),
  name: pOpt(pStr),
  text: pStr,
  child: pFiolinFormComponent,
  ...pCommonAttrs,
});

const [pCheckbox, pPartialCheckbox] = pObjAndPartial<FiolinFormComponentType, FiolinFormCheckbox>({
  type: pStrLit('CHECKBOX'),
  name: pStr,
  value: pOpt(pStr),
  checked: pOpt(pBool),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pColor, pPartialColor] = pObjAndPartial<FiolinFormComponentType, FiolinFormColor>({
  type: pStrLit('COLOR'),
  name: pStr,
  value: pOpt(pStr),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pDate, pPartialDate] = pObjAndPartial<FiolinFormComponentType, FiolinFormDate>({
  type: pStrLit('DATE'),
  name: pStr,
  value: pOpt(pStr),
  required: pOpt(pBool),
  min: pOpt(pStr),
  max: pOpt(pStr),
  step: pOpt(pNum),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pDatetimeLocal, pPartialDatetimeLocal] = pObjAndPartial<FiolinFormComponentType, FiolinFormDatetimeLocal>({
  type: pStrLit('DATETIME_LOCAL'),
  name: pStr,
  value: pOpt(pStr),
  required: pOpt(pBool),
  min: pOpt(pStr),
  max: pOpt(pStr),
  step: pOpt(pNum),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pEmail, pPartialEmail] = pObjAndPartial<FiolinFormComponentType, FiolinFormEmail>({
  type: pStrLit('EMAIL'),
  name: pStr,
  value: pOpt(pStr),
  multiple: pOpt(pBool),
  pattern: pOpt(pStr),
  required: pOpt(pBool),
  placeholder: pOpt(pStr),
  size: pOpt(pNum),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pFile, pPartialFile] = pObjAndPartial<FiolinFormComponentType, FiolinFormFile>({
  type: pStrLit('FILE'),
  name: pOpt(pStr),
  multiple: pOpt(pBool),
  accept: pOpt(pStr),
  submit: pOpt(pBool),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pNumber, pPartialNumber] = pObjAndPartial<FiolinFormComponentType, FiolinFormNumber>({
  type: pStrLit('NUMBER'),
  name: pStr,
  value: pOpt(pNum),
  required: pOpt(pBool),
  placeholder: pOpt(pStr),
  min: pOpt(pNum),
  max: pOpt(pNum),
  step: pOpt(pNum),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pRadio, pPartialRadio] = pObjAndPartial<FiolinFormComponentType, FiolinFormRadio>({
  type: pStrLit('RADIO'),
  name: pStr,
  value: pStr,
  checked: pOpt(pBool),
  required: pOpt(pBool),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pRange, pPartialRange] = pObjAndPartial<FiolinFormComponentType, FiolinFormRange>({
  type: pStrLit('RANGE'),
  name: pStr,
  value: pOpt(pNum),
  min: pNum,
  max: pNum,
  step: pOpt(pNum),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pTel, pPartialTel] = pObjAndPartial<FiolinFormComponentType, FiolinFormTel>({
  type: pStrLit('TEL'),
  name: pStr,
  value: pOpt(pStr),
  pattern: pOpt(pStr),
  required: pOpt(pBool),
  placeholder: pOpt(pStr),
  size: pOpt(pNum),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pText, pPartialText] = pObjAndPartial<FiolinFormComponentType, FiolinFormText>({
  type: pStrLit('TEXT'),
  name: pStr,
  value: pOpt(pStr),
  pattern: pOpt(pStr),
  required: pOpt(pBool),
  placeholder: pOpt(pStr),
  size: pOpt(pNum),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pTime, pPartialTime] = pObjAndPartial<FiolinFormComponentType, FiolinFormTime>({
  type: pStrLit('TIME'),
  name: pStr,
  value: pOpt(pStr),
  required: pOpt(pBool),
  min: pOpt(pStr),
  max: pOpt(pStr),
  step: pOpt(pNum),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pUrl, pPartialUrl] = pObjAndPartial<FiolinFormComponentType, FiolinFormUrl>({
  type: pStrLit('URL'),
  name: pStr,
  value: pOpt(pStr),
  pattern: pOpt(pStr),
  required: pOpt(pBool),
  placeholder: pOpt(pStr),
  size: pOpt(pNum),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const pSelectOption = pObjWithProps<FiolinFormSelectOption>({
  text: pStr,
  value: pOpt(pStr),
  selected: pOpt(pBool),
});

const [pSelect, pPartialSelect] = pObjAndPartial<FiolinFormComponentType, FiolinFormSelect>({
  type: pStrLit('SELECT'),
  name: pStr,
  options: pArr(pSelectOption),
  multiple: pOpt(pBool),
  required: pOpt(pBool),
  ...pCommonInputAttrs,
  ...pCommonAttrs,
});

const [pButton, pPartialButton] = pObjAndPartial<FiolinFormComponentType, FiolinFormButton>({
  type: pStrLit('BUTTON'),
  text: pStr,
  name: pOpt(pStr),
  value: pOpt(pStr),
  disabled: pOpt(pBool),
  ...pCommonAttrs,
});

const [pOutput, pPartialOutput] = pObjAndPartial<FiolinFormComponentType, FiolinFormOutput>({
  type: pStrLit('OUTPUT'),
  name: pStr,
  value: pOpt(pStr),
  ...pCommonAttrs,
});

const [pCanvas, pPartialCanvas] = pObjAndPartial<FiolinFormComponentType, FiolinFormCanvas>({
  type: pStrLit('CANVAS'),
  name: pStr,
  height: pNum,
  width: pNum,
  ...pCommonAttrs,
});
