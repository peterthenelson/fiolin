
export function dedent(s: string): string {
  const lines = s.split('\n');
  if (lines.length === 1) {
    return s;
  }
  if (lines[0] !== '') {
    throw new Error('Expected first line of multiline string to be empty');
  }
  const indent = lines[1].match(/^ */)![0].length;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].match(/^\s*$/)) continue;
    if (lines[i].match(/^ */)![0].length < indent) {
      throw new Error(`Line expected to have ${indent} leading spaces; got ${lines[i]}`);
    }
    lines[i] = lines[i].substring(indent);
  }
  return lines.join('\n');
}

export function indent(s: string, prefix: string, firstLine?: boolean): string {
  const lines = s.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (i === 0 && !firstLine) continue;
    if (lines[i] === '') continue;
    lines[i] = prefix + lines[i];
  }
  return lines.join('\n');
}

export function redent(s: string, prefix: string, firstLine?: boolean): string {
  return indent(dedent(s), prefix, firstLine);
}
