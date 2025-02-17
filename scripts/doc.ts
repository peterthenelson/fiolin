import { pkgPath } from '../utils/pkg-path';
import { PyodideRunner } from '../common/runner';
import { FiolinScript } from '../common/types';
import { readFileSync, writeFileSync } from 'node:fs';
import { dedent } from '../common/indent';

async function genPyDoc() {
  const runner = new PyodideRunner({ indexUrl: pkgPath('node_modules/pyodide') });
  console.log('Generating docs/fiolin-module.md');
  const python = dedent(`
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
  `);
  const script: FiolinScript = {
    meta: { title: 'generate docs', description: 'generate pydoc for fiolin.py' },
    interface: { inputFiles: 'NONE', outputFiles: 'SINGLE' },
    runtime: {},
    code: { python },
  };
  const response = await runner.run(script, { inputs: [] });
  if (response.error) {
    console.error(response.error.message);
    process.exit(1);
  } else {
    for (const f of response.outputs) {
      writeFileSync(pkgPath(`docs/fiolin-module.md`), Buffer.from(await f.arrayBuffer()));
    }
  }
}

function genTsDoc(tsPath: string, mdPath: string) {
  console.log(`Generating ${mdPath}`);
  // TODO: Use @microsoft/tsdoc or something to do the parsing instead
  const ts = readFileSync(pkgPath(tsPath), { encoding: 'utf-8' });
  type State = 'WAIT_IT_COMMENT' | 'IT_COMMENT' | 'WAIT_F_COMMENT' | 'F_COMMENT' | 'WAIT_T_END';
  interface Field {
    name: string;
    comment: string;
    typeVerbatim: string;
  }
  interface Interface {
    name: string;
    comment: string;
    fields: Field[];
    typeVerbatim?: string;
  }
  let state: State = 'WAIT_IT_COMMENT';
  let comment = '';
  const interfaces: Interface[] = [];
  for (const line of ts.split('\n')) {
    const commentMatch = line.match(/^\s*\/\/ ?(.*)/);
    const importMatch = line.match(/^import.*/);
    const interfaceTypeMatch = line.match(/^(?:export )?(interface|type|const) (.*) (?:.*)/);
    const fieldMatch = line.match(/^\s*([a-zA-Z_][^:]*): (.*);$/);
    const isWhitespace = line.match(/^\s*$/) !== null;
    if (state === 'WAIT_IT_COMMENT') {
      if (commentMatch) {
        state = 'IT_COMMENT';
        comment = commentMatch.at(1);
      } else if (importMatch) {
        // Skip
      } else if (!isWhitespace) {
        console.error(`Expected interface/type comment or blank line; got: ${line}`);
        process.exit(1);
      }
    } else if (state === 'IT_COMMENT') {
      if (commentMatch) {
        comment += '\n' + commentMatch.at(1);
      } else if (interfaceTypeMatch && interfaceTypeMatch.at(1) === 'interface') {
        state = 'WAIT_F_COMMENT';
        interfaces.push({ name: interfaceTypeMatch.at(2), comment, fields: [] });
        comment = '';
      } else if (interfaceTypeMatch && (interfaceTypeMatch.at(1) === 'type' || interfaceTypeMatch.at(1) === 'const')) {
        state = 'WAIT_T_END';
        interfaces.push({ name: interfaceTypeMatch.at(2), comment, fields: [], typeVerbatim: '' })
      } else {
        console.error(`Expected interface/type comment or decl; got: ${line}`);
        process.exit(1);
      }
    } else if (state === 'WAIT_F_COMMENT') {
      if (commentMatch) {
        state = 'F_COMMENT';
        comment = commentMatch.at(1);
      } else if (line === '}') {
        state = 'WAIT_IT_COMMENT';
      } else if (!isWhitespace) {
        console.error(`Expected field comment, blank line, or }; got: ${line}`);
        process.exit(1);
      }
    } else if (state === 'F_COMMENT') {
      if (commentMatch) {
        comment += '\n' + commentMatch.at(1);
      } else if (fieldMatch) {
        state = 'WAIT_F_COMMENT';
        interfaces.at(-1).fields.push({ name: fieldMatch.at(1), comment, typeVerbatim: fieldMatch.at(2) });
        comment = '';
      } else if (line === '}') {
        console.warn(`Dangling field comment: ${comment}`);
        comment = '';
        state = 'WAIT_IT_COMMENT';
      } else {
        console.error(`Expected field comment or decl; got: ${line}`);
        process.exit(1);
      }
    } else if (state === 'WAIT_T_END') {
      if (line === ')' || line === ');' || line === '') {
        state = 'WAIT_IT_COMMENT';
      } else {
        interfaces.at(-1).typeVerbatim! += line + '\n';
      }
    } else {
      console.error(`Unexpected state: ${state}`);
      process.exit(1);
    }
  }
  let output = '# Fiolin Script Type Definitions\n\n';
  for (const intf of interfaces) {
    output += `## ${intf.name}\n\n`;
    output += `> ${intf.comment}\n\n`
    for (const field of intf.fields) {
      output += `**${field.name}**: _${field.typeVerbatim}_\n\n`;
      output += `> ${field.comment}\n\n`;
    }
  }
  writeFileSync(pkgPath(mdPath), output);
}

await genPyDoc();
genTsDoc('common/types/fiolin-script.ts', 'docs/fiolin-script.md');
genTsDoc('common/types/form.ts', 'docs/form.md');
