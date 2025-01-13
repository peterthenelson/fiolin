import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pkgPath } from '../utils/pkg-path';

// Covert x.js or /x.js to /x.js?v=123, supposing that the contents of the file
// PKG_ROOT/server/public/x.js has a hash of 123. Alternately, the contents to
// be hashed are directly specified.
export function versionedLink(path: string, contents?: string): string {
  if (path.at(0) === '/') {
    path = path.substring(1);
  }
  // The hash method is arbitrarily chosen, but it's not crazily long and it's
  // unlikely to collide.
  let hash: string = '';
  if (contents) {
    hash = createHash('shake256', { outputLength: 6 }).update(contents).digest('base64url');
  } else {
    const buf = readFileSync(pkgPath(`server/public/${path}`));
    hash = createHash('shake256', { outputLength: 6 }).update(buf).digest('base64url');
  }
  return `/${path}?v=${hash}`;
}