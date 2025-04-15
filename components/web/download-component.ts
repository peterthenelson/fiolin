import { getByRelIdAs } from '../../web-utils/select-as';

export class DownloadComponent {
  private readonly list: HTMLDivElement;
  private readonly downloadFile: (file: File) => void;
  private items: [HTMLDivElement, File][];

  constructor(root: HTMLDivElement, files: File[], downloadFile: (file: File) => void) {
    this.list = getByRelIdAs(root, 'download-list', HTMLDivElement);
    this.downloadFile = downloadFile;
    this.items = [];
    this.setFiles(files);
    this.setUpHandlers(
      getByRelIdAs(root, 'select-button', HTMLDivElement),
      getByRelIdAs(root, 'download-button', HTMLDivElement));
  }

  setFiles(files: File[]) {
    this.items = [];
    for (const f of files) {
      const div = document.createElement('div');
      this.items.push([div, f]);
      div.classList.add('download-item');
      div.innerText = f.name;
      div.onclick = () => {
        div.classList.toggle('selected');
      }
    }
    this.list.replaceChildren(...this.items.map((x) => x[0]));
  }

  private setUpHandlers(selectAll: HTMLDivElement, downloadButton: HTMLDivElement) {
    selectAll.onclick = () => {
      if (this.items.every((i) => i[0].classList.contains('selected'))) {
        for (const i of this.items) {
          i[0].classList.remove('selected');
        }
      } else {
        for (const i of this.items) {
          i[0].classList.add('selected');
        }
      }
    };
    downloadButton.onclick = () => {
      for (const i of this.items.filter((i) => i[0].classList.contains('selected'))) {
        this.downloadFile(i[1]);
      }
    };
  }
}
