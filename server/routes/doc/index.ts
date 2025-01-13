import { mdDoc } from '../../html';

export default defineEventHandler((event) => {
  return mdDoc('index');
});
