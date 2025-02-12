import { describe, expect, it } from 'vitest';
import { getDebug, getStdout, mkFile, mkRunner, mkScript, multiRe } from './runner-test-util';

describe('PyodideRunner runtime options', () => {
  describe('python package installation', () => {
    it('automatically installs pkgs', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'))
      `, { pkgs: ['idna'] });
      const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
      expect(response.error).toBeUndefined();
      expect(getStdout(response).trim()).toEqual("b'xn--eckwd4c7c.xn--zckzah'");
      expect(getDebug(response)).toMatch(multiRe(
        /1 python packages to be installed.*/,
        /Installing package idna.*/,
        /Resetting FS.*/
      ));
    });

    it('can manually preinstall pkgs', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'))
      `, { pkgs: ['idna'] });
      await runner.installPkgs(script);
      const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
      expect(response.error).toBeUndefined();
      expect(getStdout(response).trim()).toEqual("b'xn--eckwd4c7c.xn--zckzah'");
      expect(getDebug(response)).toMatch(multiRe(
        /Required packages\/modules already installed.*/,
        /Resetting FS.*/
      ));
    });

    it('avoids redundant pkg installation', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'), file=sys.stderr)
      `, { pkgs: ['idna'] });
      {
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /1 python packages to be installed.*/,
          /Installing package idna.*/,
          /Resetting FS.*/
        ));
      }
      {
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /Required packages\/modules already installed.*/,
          /Resetting FS.*/
        ));
      }
    });

    it('reloads the interpreter when pkgs change', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import idna
        import sys
        # Example from the docs; prints b'xn--eckwd4c7c.xn--zckzah'
        print(idna.encode('ドメイン.テスト'), file=sys.stderr)
      `, { pkgs: ['idna'] });
      {
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /1 python packages to be installed.*/,
          /Installing package idna.*/,
          /Resetting FS.*/
        ));
      }
      {
        script.runtime.pythonPkgs?.push({ type: 'PYPI', name: 'six' });
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /Required packages\/modules differ from those installed.*/,
          /2 python packages to be installed.*/,
          /Installing package idna.*/,
          /Installing package six.*/,
          /Resetting FS.*/
        ));
      }
    });
  });

  describe('wasm module installation', () => {
    it('automatically installs mods', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import imagemagick
        import sys
        print(imagemagick.Magick.imageMagickVersion)
      `, { mods: ['imagemagick'] });
      const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
      expect(response.error).toBeUndefined();
      expect(getStdout(response).trim()).toMatch(/ImageMagick.*imagemagick.org/);
      expect(getDebug(response)).toMatch(multiRe(
        /1 wasm modules to be installed.*/,
        /Installing module imagemagick.*/,
        /Resetting FS.*/
      ));
    });

    it('can manually preinstall mods', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import imagemagick
        import sys
        print(imagemagick.Magick.imageMagickVersion)
      `, { mods: ['imagemagick'] });
      await runner.installPkgs(script);
      const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
      expect(response.error).toBeUndefined();
      expect(getStdout(response).trim()).toMatch(/ImageMagick.*imagemagick.org/);
      expect(getDebug(response)).toMatch(multiRe(
        /Required packages\/modules already installed.*/,
        /Resetting FS.*/
      ));
    });

    it('avoids redundant mod installation', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import imagemagick
        import sys
        print(imagemagick.Magick.imageMagickVersion, file=sys.stderr)
      `, { mods: ['imagemagick'] });
      {
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /1 wasm modules to be installed.*/,
          /Installing module imagemagick.*/,
          /Resetting FS.*/
        ));
      }
      {
        const response = await runner.run(script, { inputs: [mkFile('foo', 'foo')] });
        expect(response.error).toBeUndefined();
        expect(getDebug(response)).toMatch(multiRe(
          /Required packages\/modules already installed.*/,
          /Resetting FS.*/
        ));
      }
    });
  });
});
