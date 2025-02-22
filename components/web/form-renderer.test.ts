/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { RenderedForm } from './form-renderer';
import { FiolinFormComponentId, FiolinFormEvent, FiolinScriptInterface } from '../../common/types';

describe('form renderer', () => {
  it('handles all event handler types', () => {
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
    const _ = RenderedForm.render(formElem, ui, handler);
    expect(formElem.childElementCount).toEqual(2);
    const nameRaw = formElem.childNodes.item(0);
    expect(nameRaw).toBeInstanceOf(HTMLInputElement);
    const name: HTMLInputElement = nameRaw as HTMLInputElement;
    expect(name.name).toEqual('name');
    const telRaw = formElem.childNodes.item(1);
    expect(telRaw).toBeInstanceOf(HTMLInputElement);
    const tel: HTMLInputElement = telRaw as HTMLInputElement;
    expect(tel.name).toEqual('tel');
    name.value = 'new name';
    name.dispatchEvent(new Event('change'));
    tel.value = '987-654-3210';
    tel.dispatchEvent(new InputEvent('input'));
    events.forEach(([_, e]) => { e.timeStamp = 123 })
    expect(events).toEqual([
      [
        { name: 'name' },
        {
          type: 'INPUT',
          subtype: 'change',
          target: { name: 'name' },
          timeStamp: 123,
          value: 'new name',
        }
      ],
      [
        { name: 'tel' },
        {
          type: 'INPUT',
          subtype: 'input',
          target: { name: 'tel' },
          timeStamp: 123,
          value: '987-654-3210',
        }
      ],
    ]);
  });
});