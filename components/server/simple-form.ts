import { redent } from '../../common/indent';
import { typeSwitch } from '../../common/tagged-unions';
import { FiolinScript } from '../../common/types';
import { loadSvg } from '../../utils/load-svg';

export function renderSimpleForm(opts?: { script?: FiolinScript, numSpaces?: number }) {
  const hidden = opts?.script?.interface?.form === undefined ? '' : 'hidden';
  // Should be kept in sync or shared with web/simple-form
  const txt: string = typeSwitch({ type: opts?.script?.interface?.inputFiles || 'NONE' }, {
    'NONE': (_) => '',
    'SINGLE': (_) => 'Choose File',
    'MULTI': (_) => 'Choose Files',
    'ANY': (_) => 'Choose File(s)',
  });
  return redent(`
    <label class="files-label ${hidden}">
      <div class="files-panel button flex-row-wrap">
        <span class="files-panel-text input-files-text" data-rel-id="input-files-text">${txt}</span>
        <div class="circle-button button" data-rel-id="run-button" title="Run Script">
          ${loadSvg('run')}
        </div>
        <span class="files-panel-text output-files-text" data-rel-id="output-files-text"></span>
      </div>
      <input type="file" data-rel-id="input-files-chooser" disabled />
    </label>
  `, ' '.repeat(opts?.numSpaces || 0));
}