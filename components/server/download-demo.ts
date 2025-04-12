import { redent } from '../../common/indent';

export function renderDownloadDemo(opts?: { numSpaces?: number }) {
  return redent(`
    <div class="download-container">
      <div class="flex-row-wrap">
        <span>Download</span>
        <div class="download-button" title="Download All"></div> 
      </div>
      <div class="download-list">
        <div class="download-item">foo.txt</div>
        <div class="download-item">bar.jpg</div>
      </div>
    </div>
  `, ' '.repeat(opts?.numSpaces || 0));
}