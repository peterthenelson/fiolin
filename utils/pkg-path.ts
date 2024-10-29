import path from 'node:path';

export function pkgPath(relativeToPkgRoot: string): string {
  return path.resolve(path.join(__dirname, '..', relativeToPkgRoot));
}
