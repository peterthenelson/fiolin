import { pkgPath } from '../utils/pkg-path';
import { PyodideRunner } from '../common/runner';
import { FiolinScript } from '../common/types';
import { writeFileSync } from 'node:fs';

const runner = new PyodideRunner({ indexUrl: pkgPath('node_modules/pyodide') });
const python = `
import inspect
import fiolin
import sys

def indent(s, prefix='  '):
  return '\\n'.join([prefix + l for l in s.split('\\n')])

def para(f, s):
  f.write(str(s) + '\\n\\n')

def docfun(f, prefix, name, fun):
  sig = inspect.signature(fun)
  para(f, f'{prefix}.**{name}**{sig}')
  doc = inspect.getdoc(fun)
  if doc:
    para(f, indent(doc, '> '))

def doccls(f, prefix, name, cls):
  para(f, f'class {prefix}.**{name}**')
  doc = inspect.getdoc(cls)
  if doc:
    para(f, indent(doc, '> '))
  for mname, meth in inspect.getmembers(cls):
    if inspect.isfunction(meth) and mname in cls.__dict__ and not mname.startswith('_'):
      docfun(f, name, mname, meth)
    elif not inspect.isfunction(meth) and mname.isupper():
      para(f, f'{name}.**{mname}** = {meth}')

with open('/output/fiolin.md', 'w') as f:
  para(f, '# fiolin - Utility library for fiolin Scripts')
  para(f, '## Description')
  para(f, inspect.getdoc(fiolin))
  para(f, '## Functions')
  for name, fun in inspect.getmembers(fiolin, inspect.isfunction):
    if name.startswith('_'):
      continue
    docfun(f, 'fiolin', name, fun)
  para(f, '## Classes')
  for name, cls in inspect.getmembers(fiolin, inspect.isclass):
    doccls(f, 'fiolin', name, cls)
`;
const script: FiolinScript = {
  meta: { title: 'generate docs', description: 'generate pydoc for fiolin.py' },
  interface: { inputFiles: 'NONE', outputFiles: 'SINGLE' },
  runtime: {},
  code: { python },
};
const response = await runner.run(script, { inputs: [], argv: '' });
if (response.error) {
  console.error(response.error.message);
} else {
  for (const f of response.outputs) {
    writeFileSync(pkgPath(`docs/fiolin-module.md`), Buffer.from(await f.arrayBuffer()));
  }
}
