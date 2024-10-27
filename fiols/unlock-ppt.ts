import { FiolinScriptTemplate } from '../common/types';

export const config: FiolinScriptTemplate = {
  meta: {
    title: 'Unlock PPT',
    author: 'Peter Nelson',
    description: 'Unlock a password-protected PowerPoint file',
    extensions: ['ppt', 'pptx'],
  },
  interface: {
    inputFiles: 'SINGLE',
    outputFiles: 'SINGLE',
  },
  runtime: {},
};
