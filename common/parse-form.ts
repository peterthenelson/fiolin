import { ObjPath, pArr, pBool, pNum, pObj, pObjWithProps, pOpt, pStr, pStrLit, pStrUnion, pTaggedUnion } from './parse';
import { FiolinForm, FiolinFormButton, FiolinFormDiv, FiolinFormComponent, FiolinFormText, FiolinFormLabel, FiolinFormSelect, FiolinFormSelectOption  } from './types/form';

export const pForm = pObjWithProps<FiolinForm>({
  children: pArr(pComponent),
  autofocusedName: pOpt(pStr),
  hideFileChooser: pOpt(pBool),
});

function pComponent(p: ObjPath, v: unknown): FiolinFormComponent {
  return pTaggedUnion<FiolinFormComponent>({
    'DIV': pDiv,
    'LABEL': pLabel,
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

const pText = pObjWithProps<FiolinFormText>({
  type: pStrLit('TEXT'),
  name: pStr,
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
