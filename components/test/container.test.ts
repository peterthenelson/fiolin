/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { renderContainer, FiolinContainerOptions } from '../server/container';
import { dedent } from '../../common/indent';
import { loadAllTutorials, loadScript } from '../../utils/config';

describe('container', () => {
  describe('rendering and initialization', () => {
    it('works for 1p', () => {
      const serverOpts: FiolinContainerOptions = {
        mode: '1P',
        script: loadScript('extract-winmail'),
        numSpaces: 4,
      };
      document.write(dedent(`
        <html>
          <body>
            ${renderContainer(serverOpts)}
          </body>
        </html>
      `));
      // TODO: client initialization
    });
    it('works for playground', async () => {
      const serverOpts: FiolinContainerOptions = {
        mode: 'PLAYGROUND',
        tutorials: await loadAllTutorials(),
        numSpaces: 4,
      };
      document.write(dedent(`
        <html>
          <body>
            ${renderContainer(serverOpts)}
          </body>
        </html>
      `));
      // TODO: client initialization
    });
  });
});