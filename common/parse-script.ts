import { pArr, pStr, pStrUnion, pObjWithProps, pStrLit, pOpt } from './parse';
import { FiolinScript, FiolinScriptCode, FiolinScriptMeta, FiolinScriptRuntime, FiolinScriptInterface, FiolinPyPackage, FiolinWasmModule } from './types';
import { pForm } from './parse-form';

export const pFileEnum = pStrUnion<('NONE' | 'SINGLE' | 'MULTI' | 'ANY')[]>(['NONE', 'SINGLE', 'MULTI', 'ANY']);

const pMeta = pObjWithProps<FiolinScriptMeta>({
  title: pStr,
  description: pStr,
  author: pOpt(pStr),
  extensions: pOpt(pArr(pStr)),
});

const pInterface = pObjWithProps<FiolinScriptInterface>({
  inputFiles: pFileEnum,
  inputAccept: pOpt(pStr),
  outputFiles: pFileEnum,
  form: pOpt(pForm),
});

const pPyPkg = pObjWithProps<FiolinPyPackage>({
  type: pStrLit('PYPI'),
  name: pStr,
});

const pWasmMod = pObjWithProps<FiolinWasmModule>({ name: pStr });

const pRuntime = pObjWithProps<FiolinScriptRuntime>({
  pythonPkgs: pOpt(pArr(pPyPkg)),
  wasmModules: pOpt(pArr(pWasmMod)),
});

const pCode = pObjWithProps<FiolinScriptCode>({ python: pStr });

export const pFiolinScript = pObjWithProps<FiolinScript>({
  meta: pMeta,
  interface: pInterface,
  runtime: pRuntime,
  code: pCode,
});
