import { describe, expect, it } from 'vitest';
import { RenderedForm } from './form-renderer';
import { FiolinFormComponentId, FiolinFormEvent, FiolinScriptInterface } from '../../common/types';

describe('form renderer', () => {
  // TODO: Install happy-dom or whatever and make a test that works
  it('handles all event handler types', () => {
    /*
    const formElem = document.createElement('form');
    const ui: FiolinScriptInterface = {
      inputFiles: 'ANY', outputFiles: 'ANY',
      form: {
        children: [
          { type: 'TEXT', name: 'name', placeholder: 'your name', onchange: true },
          { type: 'TEL', name: 'tel', placeholder: '123-345-6789', oninput: true },
        ],
      }
    };
    const events: [FiolinFormComponentId, FiolinFormEvent][] = [];
    const handler = (id: FiolinFormComponentId, ev: FiolinFormEvent) => {
      events.push([id, ev]);
    }
    const f = RenderedForm.render(formElem, ui, handler);
    expect(formElem.childElementCount).toEqual(2);
    const nameRaw = formElem.childNodes.item(0);
    expect(nameRaw).toBeInstanceOf(HTMLInputElement);
    const name: HTMLInputElement = nameRaw as HTMLInputElement;
    const telRaw = formElem.childNodes.item(0);
    expect(telRaw).toBeInstanceOf(HTMLInputElement);
    const tel: HTMLInputElement = telRaw as HTMLInputElement;
    name.value = 'new name';
    tel.value = '987-654-3210';
    expect(events).toEqual([
      [{ name: 'name' }, { type: 'INPUT', subtype: 'change' }],
      [{ name: 'tel' }, { type: 'INPUT', subtype: 'input' }],
    ]);
    */
  });
});