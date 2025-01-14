import { FiolinScript } from '../../common/types';
import { maybeGetByRelIdAs } from '../../web-utils/select-as';
import { setSelected } from '../../web-utils/set-selected';
import { LoaderComponent } from './loader-component';

export interface TutorialOptions {
  tutorials?: Record<string, FiolinScript>;
}

export class TutorialLoader extends LoaderComponent {
  private readonly tutorialSelect?: HTMLSelectElement;
  private readonly tutorials?: Record<string, FiolinScript>;

  constructor(container: HTMLElement, opts: TutorialOptions) {
    super();
    this.tutorialSelect = maybeGetByRelIdAs(container, 'tutorial-select', HTMLSelectElement);
    this.tutorials = opts.tutorials;
  }

  isEnabled(): boolean {
    return (this.tutorials !== undefined && Object.keys(this.tutorials).length > 0);
  }

  async load(): Promise<FiolinScript> {
    if (this.tutorials && Object.keys(this.tutorials).length > 0) {
      const hash = window.location.hash.substring(1);
      if (hash !== '' && hash in this.tutorials) {
        if (this.tutorialSelect) setSelected(this.tutorialSelect, hash);
        return this.tutorials[hash];
      } else {
        const first = Object.keys(this.tutorials).sort()[0]
        window.location.hash = first;
        return this.tutorials[first];
      }
    }
    throw new Error('TutorialLoader not enabled but .load() called');
  }
}
