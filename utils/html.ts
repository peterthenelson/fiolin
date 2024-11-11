import { redent } from '../common/indent';

export function fiolinSharedHeaders(): string {
  return redent(`
    <link rel="stylesheet" href="/index.css">
    <link rel="stylesheet" href="/bundle/host.css">
    <script src="/bundle/host.js" type="module" defer></script>
  `, '    ');
}

export interface FiolinContainerOptions {
  // Title for the script (defaults to empty)
  title?: string;
  // Description for the script (defaults to Loading...)
  desc?: string;
  // Start with the script editor initially opened
  editorOpen?: boolean;
}

export function fiolinContainer(options?: FiolinContainerOptions): string {
  options = options || {};
  return redent(`
    <div id="container">
      <div id="script-header">
        <div id="script-title">${options.title || ''}</div>
        <div id="script-mode-button" title="Edit Script">✎</div>
      </div>
      <div id="script">
        <pre id="script-desc">${options.desc || 'Loading...'}</pre>
        <div id="script-editor"${options.editorOpen ? '' : 'class="hidden"'}></div>
      </div>
      <div id="controls">
        <label id="input-files" for="input-files-chooser" class="files-label">
          <div class="files-panel">
            <p class="files-panel-text">Choose An Input File</p>
          </div>
          <input type="file" id="input-files-chooser" disabled />
        </label>
        <!-- TODO -->
      </div>
      <div id="output">
        <pre id="output-term">Loading...</pre>
      </div>
    </div>
  `, '    ');
}
