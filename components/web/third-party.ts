import { getByRelIdAs, selectAs } from '../../web-utils/select-as';
import { StorageLike } from '../../web-utils/types';

export interface ThirdPartOpts {
  username: string;
  path: string;
  storage: StorageLike;
}

export class ThirdParty {
  private readonly root: HTMLDivElement;
  private readonly avatar: HTMLImageElement;
  private readonly userLink: HTMLAnchorElement;
  private readonly dialog: HTMLDialogElement;
  private readonly form: HTMLFormElement;
  private readonly formAvatar: HTMLImageElement;
  private readonly formUserLink: HTMLAnchorElement;
  private readonly confirmInput: HTMLInputElement;
  private readonly opts?: ThirdPartOpts;

  constructor(container: HTMLElement, opts?: ThirdPartOpts) {
    this.root = getByRelIdAs(container, 'third-party', HTMLDivElement);
    this.avatar = getByRelIdAs(this.root, 'gh-avatar', HTMLImageElement);
    this.userLink = getByRelIdAs(this.root, 'gh-user-link', HTMLAnchorElement);
    this.dialog = getByRelIdAs(this.root, 'approve-dialog', HTMLDialogElement);
    this.form = getByRelIdAs(this.root, 'approve-form', HTMLFormElement);
    this.formAvatar = getByRelIdAs(this.root, 'form-gh-avatar', HTMLImageElement);
    this.formUserLink = getByRelIdAs(this.root, 'form-gh-user-link', HTMLAnchorElement);
    this.confirmInput = selectAs(this.form, '[name="gh-user-name"]', HTMLInputElement);
    this.opts = opts;
    this.setUpHandlers();
  }

  private setUpHandlers() {
    this.form.onsubmit = (event) => {
      if (event.submitter instanceof HTMLButtonElement &&
          event.submitter.value === 'cancel') {
        // Go home on cancel
        window.location.replace(window.location.origin);
      }
      if ((new FormData(this.form)).get('remember') === 'on') {
        this.saveApproval();
      }
    };
  }

  private hasApproval(): boolean {
    if (!this.opts) return false;
    return this.opts.storage.getItem(`3p/${this.opts.username}/${this.opts.path}`) !== null;
  }

  private saveApproval() {
    if (!this.opts) return;
    this.opts.storage.setItem(`3p/${this.opts.username}/${this.opts.path}`, 'true');
  }

  onLoad() {
    if (this.opts !== undefined) {
      const al = `https://github.com/${this.opts.username}.png`;
      const un = this.opts.username;
      const ul = `https://github.com/${this.opts.username}`;
      this.avatar.src = al;
      this.formAvatar.src = al;
      this.userLink.textContent = un;
      this.userLink.href = ul;
      this.formUserLink.textContent = un;
      this.formUserLink.href = ul;
      this.confirmInput.placeholder = un;
      this.confirmInput.pattern = '^' + un.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&') + '$';
      this.root.classList.remove('hidden');
      if (!this.hasApproval()) {
        this.dialog.showModal();
      }
    } else {
      this.root.classList.add('hidden');
    }
  }
}