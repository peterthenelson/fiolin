import { redent } from '../../common/indent';

export function renderEditor(numSpaces?: number): string {
  return redent(`
    <div class="script-editor-frame">
      <div class="script-editor-tabs" data-rel-id="script-editor-tabs">
        <div class="script-editor-tab active" data-model="script.py">Python</div>
        <div class="script-editor-tab" data-model="script.yml">Yaml</div>
      </div>
      <div class="script-editor" data-rel-id="script-editor"></div>
    </div>
  `, ' '.repeat(numSpaces || 0));
}