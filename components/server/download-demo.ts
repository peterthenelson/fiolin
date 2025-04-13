import { redent } from '../../common/indent';

export function renderDownloadDemo(opts?: { numSpaces?: number }) {
  return redent(`
    <div class="download-container">
      <div class="flex-row-wrap">
        <span>Outputs</span>
        <div class="select-button" title="Select All Files"></div> 
        <div class="download-button" title="Download Selected Files"></div> 
      </div>
      <div class="download-list">
        <div class="download-item">abc.txt</div>
        <div class="download-item">def.jpg</div>
        <div class="download-item">ghi.jpg</div>
        <div class="download-item">jkl.jpg</div>
        <div class="download-item">mno.jpg</div>
        <div class="download-item">pqr.jpg</div>
        <div class="download-item">stu.jpg</div>
        <div class="download-item">vwx.jpg</div>
        <div class="download-item">yz1.jpg</div>
        <div class="download-item">234.jpg</div>
        <div class="download-item">567.jpg</div>
        <div class="download-item">890.jpg</div>
      </div>
    </div>
  `, ' '.repeat(opts?.numSpaces || 0));
}