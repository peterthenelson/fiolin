import { getByRelIdAs } from '../../web-utils/select-as';

export interface ThirdPartOpts {
  username: string;
  path: string;
}

export class ThirdParty {
  private readonly root: HTMLDivElement;
  private readonly avatar: HTMLImageElement;
  private readonly userLink: HTMLAnchorElement;
  private readonly opts?: ThirdPartOpts;

  constructor(container: HTMLElement, opts?: ThirdPartOpts) {
    this.root = getByRelIdAs(container, 'third-party', HTMLDivElement);
    this.avatar = getByRelIdAs(this.root, 'gh-avatar', HTMLImageElement);
    this.userLink = getByRelIdAs(this.root, 'gh-user-link', HTMLAnchorElement);
    this.opts = opts;
  }

  onLoad() {
    if (this.opts !== undefined) {
      this.avatar.src = `https://github.com/${this.opts.username}.png`;
      this.userLink.textContent = this.opts.username;
      this.userLink.href = `https://github.com/${this.opts.username}`;
      this.root.classList.remove('hidden');
    } else {
      this.root.classList.add('hidden');
    }
  }
}