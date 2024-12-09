import { loadScript } from '../../../../utils/config';

export default defineEventHandler((event) => {
  const name = getRouterParam(event, 'id')
  const script = loadScript(name);
  return JSON.stringify(script, null, 2);
});
