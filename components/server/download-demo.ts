import { redent } from '../../common/indent';

export function renderDownloadDemo(opts?: { numSpaces?: number }) {
  return redent(`
    <div class="download-container">
      <div class="flex-row-wrap">
        <span>Outputs</span>
        <div class="select-button" data-rel-id="select-button"
         title="Select All Files">
        </div> 
        <div class="download-button" data-rel-id="download-button"
         title="Download Selected Files">
        </div> 
      </div>
      <div class="download-list" data-rel-id="download-list">
        <div class="download-item">abc.txt</div>
      </div>
    </div>
  `, ' '.repeat(opts?.numSpaces || 0));
}