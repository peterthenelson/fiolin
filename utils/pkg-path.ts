import path from 'node:path';

function getBase(): string {
  if (typeof __dirname !== 'undefined') {
    return path.resolve(path.join(__dirname, '..'));
  } else if (typeof process.env.npm_package_json !== 'undefined') {
    return path.dirname(process.env.npm_package_json)
  } else {
    throw new Error('Cannot resolve base package directory')
  }
}

export function pkgPath(relativeToPkgRoot: string): string {
  return path.resolve(path.join(getBase(), relativeToPkgRoot));
}
