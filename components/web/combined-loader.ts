import { FiolinScript } from '../../common/types';
import { LoaderComponent } from './loader-component';

// Multiple loaders together, with events delegated to all of them.
export class CombinedLoader extends LoaderComponent {
  private readonly loaders: LoaderComponent[];

  constructor(loaders: LoaderComponent[]) {
    super();
    this.loaders = loaders;
  }

  isEnabled(): boolean {
    const enabled = this.loaders.map((l) => l.isEnabled());
    return enabled.includes(true);
  }

  load(): Promise<FiolinScript> {
    for (const l of this.loaders) {
      if (l.isEnabled()) {
        return l.load();
      }
    }
    throw new Error('No loaders enabled but .load() called');
  }
}