import { redent } from '../../common/indent';
import { FiolinScript } from '../../common/types';
import { RenderedForm } from '../web/form-renderer'
import { Window } from 'happy-dom';

export function renderCustomForm(opts?: { script?: FiolinScript, numSpaces?: number }) {
  const hidden = opts?.script?.interface?.form === undefined ? 'hidden' : '';
  if (opts?.script && !hidden) {
    const window = new Window({
      innerWidth: 1024, innerHeight: 768, url: "http://localhost:8080",
    });
    const document = window.document;
    const form = document.createElement('form');
    form.classList.add('script-form')
    form.dataset['relId'] = 'script-form';
    form.inert = true;
    const rf = RenderedForm.render(
      (form as unknown) as HTMLFormElement,
      opts.script.interface,
      { document: (document as unknown) as Document },
    );
    return redent(rf.form.outerHTML, ' '.repeat(opts?.numSpaces || 0));
  } else {
    return redent(`
      <form class="script-form ${hidden}" data-rel-id="script-form"></form>
    `, ' '.repeat(opts?.numSpaces || 0));
  }
}