import { redent } from '../../common/indent';
import { loadSvg } from '../../utils/load-svg';

export function renderSimpleForm(numSpaces?: number) {
  return redent(`
    <label class="files-label">
      <div class="files-panel button flex-row-wrap">
        <span class="files-panel-text input-files-text" data-rel-id="input-files-text"></span>
        <div class="circle-button button" data-rel-id="run-button" title="Run Script">
          ${loadSvg('run')}
        </div>
        <span class="files-panel-text output-files-text" data-rel-id="output-files-text"></span>
      </div>
      <input type="file" data-rel-id="input-files-chooser" disabled />
    </label>
  `, ' '.repeat(numSpaces || 0));
}