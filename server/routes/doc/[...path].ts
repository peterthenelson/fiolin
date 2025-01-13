import { mdDoc } from '../../html';

export default defineEventHandler((event) => {
  let path = getRouterParam(event, 'path');
  if (path === '/') {
    path = 'index';
  } else if (path.length > 0 && path[0] === '/') {
    path = path.substring(1);
  }
  return mdDoc(path);
});
