import { FiolinScript } from '../../common/types';
import { DeployOptions, deployScript } from '../../web-utils/deploy-gen';
import { getByRelIdAs, selectAs } from '../../web-utils/select-as';
import { setSelected } from '../../web-utils/set-selected';
import { StorageLike } from '../../web-utils/types';

function getFormValue(fd: FormData, key: string): string {
  const value = fd.get(key);
  if (value !== null) return value.toString();
  throw new Error(`Expected form data to have name ${key} but got ${Array.from(fd.keys())}`);
}

export interface DeployDialogOptions {
  storage: StorageLike;
  downloadFile(file: File): void;
}

export class DeployDialog {
  private readonly dialog: HTMLDialogElement;
  private readonly form: HTMLFormElement;
  private readonly storage: StorageLike;
  private readonly downloadFile: (file: File) => void;
  private script?: FiolinScript;
  private yml?: string;

  constructor(container: HTMLElement, opts: DeployDialogOptions) {
    this.dialog = getByRelIdAs(container, 'deploy-dialog', HTMLDialogElement);
    this.form = getByRelIdAs(container, 'deploy-form', HTMLFormElement);
    this.storage = opts.storage;
    this.downloadFile = opts.downloadFile;
    this.setUpHandlers();
  }

  private setUpHandlers() {
    this.form.onsubmit = async (event) => {
      if (event.submitter instanceof HTMLButtonElement &&
          event.submitter.value === 'cancel') {
        return;
      }
      this.saveToStorage();
      const fd = new FormData(this.form);
      const lang = fd.get('lang')?.toString() === 'SH' ? 'SH' : 'PS1';
      const opts: DeployOptions = {
        gh: {
          userName: getFormValue(fd, 'gh-user-name'),
          repoName: getFormValue(fd, 'gh-repo-name'),
          defaultBranch: getFormValue(fd, 'gh-default-branch'),
          pagesBranch: getFormValue(fd, 'gh-pages-branch'),
        },
        scriptId: getFormValue(fd, 'script-id'),
        lang
      };
      this.downloadFile(deployScript(this.script!, this.yml!, opts));
    };
  }

  showModal(script: FiolinScript, yml: string) {
    this.script = script;
    this.yml = yml;
    // Give a default suggested title based on script.meta.title (but don't do
    // this for tutorials).
    const slug = script.meta.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');
    selectAs(this.form, '[name="script-id"]', HTMLInputElement).value = (
      slug.match(/^\d+/) ? '' : slug);
    this.populateFromStorage();
    this.dialog.showModal();
  }

  private populateFromStorage() {
    selectAs(this.form, '[name="gh-user-name"]', HTMLInputElement).value = (
      this.storage.getItem('deploy/gh-user-name') || '');
    selectAs(this.form, '[name="gh-repo-name"]', HTMLInputElement).value = (
      this.storage.getItem('deploy/gh-repo-name') || '');
    selectAs(this.form, '[name="gh-default-branch"]', HTMLInputElement).value = (
      this.storage.getItem('deploy/gh-default-branch') || 'main');
    selectAs(this.form, '[name="gh-pages-branch"]', HTMLInputElement).value = (
      this.storage.getItem('deploy/gh-pages-branch') || 'gh-pages');
    const lang = this.storage.getItem('deploy/lang');
    const langSel = selectAs(this.form, '[name="lang"]', HTMLSelectElement);
    if (lang === 'SH' || lang === 'PS1') {
      setSelected(langSel, lang);
    } else if (navigator.platform.startsWith('Win')) {
      setSelected(langSel, 'PS1');
    }
  }

  private saveToStorage() {
    this.storage.setItem(
      'deploy/gh-user-name',
      selectAs(this.form, '[name="gh-user-name"]', HTMLInputElement).value);
    this.storage.setItem(
      'deploy/gh-repo-name',
      selectAs(this.form, '[name="gh-repo-name"]', HTMLInputElement).value);
    this.storage.setItem(
      'deploy/gh-default-branch',
      selectAs(this.form, '[name="gh-default-branch"]', HTMLInputElement).value);
    this.storage.setItem(
      'deploy/gh-pages-branch',
      selectAs(this.form, '[name="gh-pages-branch"]', HTMLInputElement).value);
    const lang = selectAs(this.form, 'select[name="lang"]', HTMLSelectElement);
    this.storage.setItem('deploy/lang', lang.value);
  }
}