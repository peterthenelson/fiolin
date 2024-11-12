import { mdDoc } from '../../../utils/html';

export default defineEventHandler((event) => {
  return mdDoc('index');
});
