import { describe, expect, it } from 'vitest';
import { getStdout, mkRunner, mkScript } from './runner-test-util';
import { DummyCanvasRenderingContext2D } from './fake-canvas';

describe('PyodideRunner advanced UI', () => {
  describe('form updates', () => {
    it('fails on bad form ids', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        print('ok')
      `, { form: { children: [ { type: 'TEXT', name: 'bad id' } ] } });
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).not.toBeUndefined();
      expect(response.error?.message).toMatch(/Invalid form input name: bad id/);
    });

    it('fails on buttons w/incomplete ids', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        print('ok')
      `, { form: { children: [ { type: 'BUTTON', text: 'Name but no value', name: 'x' } ] } });
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).not.toBeUndefined();
      expect(response.error?.message).toMatch(/BUTTON must specify a value if they specify a name/);
    });

    it('fails on colliding form ids', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        print('ok')
      `, {
        form: {
          children: [
            { type: 'TEXT', name: 'foo' },
            { type: 'URL', name: 'foo' },
          ]
        }
      });
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).not.toBeUndefined();
      expect(response.error?.message).toMatch(/components indistinguishable \(name=foo\)/);
    });

    it('fail updates when no such id', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import fiolin
        fiolin.form_set_hidden(name='bar')
      `, { form: { children: [ { type: 'TEXT', name: 'foo' } ] } });
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).not.toBeUndefined();
      expect(response.error?.message).toMatch(/Could not find component with name=bar/);
    });

    it('reports updates otherwise', async () => {
      const runner = mkRunner();
      const script = mkScript(`
        import fiolin
        fiolin.form_set_focus(name='checkbox')
        fiolin.form_set_hidden(name='text')
        fiolin.form_set_disabled(name='radio', value='opt-1', disabled=False)
        fiolin.form_set_hidden(name='button', value='', hidden=False)
        fiolin.form_set_disabled(name='divs-too')
        fiolin.form_set_value(name='text', value='new value')
        fiolin.form_update(name='radio', value='opt-1', partial={
          'type': 'RADIO',
          'checked': True,
        })
      `, {
        form: {
          children: [
            { type: 'CHECKBOX', name: 'checkbox' },
            { type: 'TEXT', name: 'text', value: 'this init val not part of id' },
            { type: 'RADIO', name: 'radio', value: 'opt-1' },
            { type: 'RADIO', name: 'radio', value: 'opt-2' },
            { type: 'BUTTON', text: 'Un-identifiable but not illegal' },
            { type: 'BUTTON', text: 'Empty', name: 'button', value: '' },
            { type: 'BUTTON', text: 'Non-empty', name: 'button', value: 'blah' },
            { type: 'DIV', dir: 'ROW', name: 'divs-too', children: [] },
          ],
        }
      });
      const response = await runner.run(script, { inputs: [] });
      expect(response.error).toBeUndefined();
      expect(response.formUpdates).toEqual([
        { type: 'FOCUS', id: { name: 'checkbox' } },
        { type: 'HIDDEN', id: { name: 'text' }, value: true },
        { type: 'DISABLED', id: { name: 'radio', value: 'opt-1' }, value: false },
        { type: 'HIDDEN', id: { name: 'button', value: '' }, value: false },
        { type: 'DISABLED', id: { name: 'divs-too' }, value: true },
        { type: 'VALUE', id: { name: 'text' }, value: 'new value' },
        {
          type: 'PARTIAL', id: { name: 'radio', value: 'opt-1' },
          value: { type: 'RADIO', checked: true },
        },
      ]);
    });
  });

  it('exposes canvas functionality', async () => {
    const runner = mkRunner();
    const script = mkScript(`
      import fiolin
      print(f'missing: {fiolin.get_canvas('missing')}')
      canvas = fiolin.get_canvas('present')
      canvas.fillStyle = 'red'
      canvas.fillRect(10, 20, 100, 200)
    `);
    let called = false;
    const canvas = new DummyCanvasRenderingContext2D(() => {
      console.debug('Canvas functionality invoked');
      called = true;
    })
    const response = await runner.run(script, {
      inputs: [],
      canvases: { 'present': canvas },
    });
    expect(response.error).toBeUndefined();
    expect(called).toBe(true);
    expect(getStdout(response)).toMatch(/missing: None/);
  });
});
