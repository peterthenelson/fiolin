import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pkgPath } from '../utils/pkg-path';

// Note: You can force new hashes for everything by bumping this value.
const saltInCaseOfEmergency = 1;

// Covert x.js or /x.js to /x.js?v=123, supposing that the contents of the file
// PKG_ROOT/server/public/x.js has a hash of 123. Alternately, the contents to
// be hashed are directly specified.
export function versionedLink(path: string, contents?: string): string {
  if (path.at(0) === '/') {
    path = path.substring(1);
  }
  // The hash method is arbitrarily chosen, but it's not crazily long and it's
  // unlikely to collide.
  const hash = createHash('shake256', { outputLength: 6 });
  hash.update(saltInCaseOfEmergency.toString());
  if (contents) {
    hash.update(contents)
  } else {
    const buf = readFileSync(pkgPath(`server/public/${path}`));
    hash.update(buf);
  }
  return `/${path}?v=${hash.digest('base64url')}`;
}