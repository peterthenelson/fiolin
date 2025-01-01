import { ObjPath, pArr, pBool, pNum, pObj, pOnlyKeys, pProp, pPropU, pStr, pStrLit } from './parse';
import { FiolinForm, FiolinFormButton, FiolinFormDiv, FiolinFormComponent, FiolinFormText, FiolinFormLabel, FiolinFormSelect, FiolinFormSelectOption } from './types/form';

export function pForm(p: ObjPath, v: unknown): FiolinForm {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['autofocusedName', 'hideFileChooser', 'children']);
  return {
    ...pProp(p, o, 'children', pArr(pComponent)),
    ...pPropU(p, o, 'autofocusedName', pStr),
    ...pPropU(p, o, 'hideFileChooser', pBool),
  };
}

function pComponent(p: ObjPath, v: unknown): FiolinFormComponent {
  const o: object = pObj(p, v);
  const type: string = pProp(p, o, 'type', pStr).type;
  if (type === 'DIV') {
    return pDiv(p, v);
  } else if (type === 'LABEL') {
    return pLabel(p, v);
  } else if (type === 'TEXT') {
    return pText(p, v);
  } else if (type === 'SELECT') {
    return pSelect(p, v);
  } else if (type === 'BUTTON') {
    return pButton(p, v);
  } else {
    throw p.err(`to be a FiolinFormComponent with a known type; got type "${type}"`);
  }
}

function pDiv(p: ObjPath, v: unknown): FiolinFormDiv {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'dir', 'children']);
  return {
    ...pProp(p, o, 'type', pStrLit('DIV')),
    ...pProp(p, o, 'dir', pDir),
    ...pProp(p, o, 'children', pArr(pComponent))
  };
}

function pDir(p: ObjPath, v: unknown): 'ROW' | 'COL' {
  if (v === 'ROW' || v === 'COL') return v;
  throw p.err(`be ROW or COL, got ${v}`);
}

function pLabel(p: ObjPath, v: unknown): FiolinFormLabel {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'text', 'child']);
  return {
    ...pProp(p, o, 'type', pStrLit('LABEL')),
    ...pProp(p, o, 'text', pStr),
    ...pProp(p, o, 'child', pComponent)
  };
}

function pText(p: ObjPath, v: unknown): FiolinFormText {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'name', 'pattern', 'required', 'placeholder', 'size']);
  return {
    ...pProp(p, o, 'type', pStrLit('TEXT')),
    ...pProp(p, o, 'name', pStr),
    ...pPropU(p, o, 'pattern', pStr),
    ...pPropU(p, o, 'required', pBool),
    ...pPropU(p, o, 'placeholder', pStr),
    ...pPropU(p, o, 'size', pNum),
  };
}

function pSelect(p: ObjPath, v: unknown): FiolinFormSelect {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'name', 'options', 'label', 'multiple', 'required']);
  return {
    ...pProp(p, o, 'type', pStrLit('SELECT')),
    ...pProp(p, o, 'name', pStr),
    ...pProp(p, o, 'options', pArr(pSelectOption)),
    ...pPropU(p, o, 'label', pStr),
    ...pPropU(p, o, 'multiple', pBool),
    ...pPropU(p, o, 'required', pBool),
  };
}

function pSelectOption(p: ObjPath, v: unknown): FiolinFormSelectOption {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['text', 'value', 'selected']);
  return {
    ...pProp(p, o, 'text', pStr),
    ...pPropU(p, o, 'value', pStr),
    ...pPropU(p, o, 'selected', pBool),
  };
}

function pButton(p: ObjPath, v: unknown): FiolinFormButton {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'text', 'name', 'value']);
  return {
    ...pProp(p, o, 'type', pStrLit('BUTTON')),
    ...pProp(p, o, 'text', pStr),
    ...pPropU(p, o, 'name', pStr),
    ...pPropU(p, o, 'value', pStr),
  };
}
