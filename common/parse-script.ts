import { pArr, ObjPath, pFileEnum, pObj, pOnlyKeys, pProp, pPropU, pStr } from './parse';
import { FiolinScript, FiolinScriptCode, FiolinScriptMeta, FiolinScriptRuntime, FiolinScriptInterface, FiolinPyPackage } from './types';

export function pFiolinScript(p: ObjPath, v: unknown): FiolinScript {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['meta', 'interface', 'runtime', 'code'])
  return {
    ...pProp(p, o, 'meta', pMeta),
    ...pProp(p, o, 'interface', pInterface),
    ...pProp(p, o, 'runtime', pRuntime),
    ...pProp(p, o, 'code', pCode),
  };
}

function pMeta(p: ObjPath, v: unknown): FiolinScriptMeta {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['title', 'description', 'author', 'extensions']);
  return {
    ...pProp(p, o, 'title', pStr),
    ...pProp(p, o, 'description', pStr),
    ...pPropU(p, o, 'author', pStr),
    ...pPropU(p, o, 'extensions', pArr(pStr)),
  };
}

function pInterface(p: ObjPath, v: unknown): FiolinScriptInterface {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['inputFiles', 'outputFiles']);
  return {
    ...pProp(p, o, 'inputFiles', pFileEnum),
    ...pProp(p, o, 'outputFiles', pFileEnum),
  };
}

function pPyPkg(p: ObjPath, v: unknown): FiolinPyPackage {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['type', 'name']);
  return {
    ...pProp(p, o, 'type', (p, v): 'PYPI' => {
      if (v === 'PYPI') return v;
      throw p.err(`be PYPI; got ${v}`);
    }),
    ...pProp(p, o, 'name', pStr),
  }
}

function pRuntime(p: ObjPath, v: unknown): FiolinScriptRuntime {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['pythonPkgs']);
  return {
    ...pPropU(p, o, 'pythonPkgs', pArr(pPyPkg)),
  };
}

function pCode(p: ObjPath, v: unknown): FiolinScriptCode {
  const o: object = pObj(p, v);
  pOnlyKeys(p, o, ['python']);
  return { ...pProp(p, o, 'python', pStr) };
}
