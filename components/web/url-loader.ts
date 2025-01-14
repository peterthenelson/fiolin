import { parseAs } from '../../common/parse';
import { pFiolinScript } from '../../common/parse-script';
import { FiolinScript } from '../../common/types';
import { LoaderComponent } from './loader-component';

export interface UrlLoaderOptions {
  url?: string;
  setLoadingText?: (s: string) => void;
}

export class UrlLoader extends LoaderComponent {
  private url?: string;
  private setLoadingText?: (s: string) => void;

  constructor(opts: UrlLoaderOptions) {
    super();
    this.url = opts.url;
    this.setLoadingText = opts.setLoadingText;
  }

  isEnabled(): boolean {
    return !!(this.url);
  }

  async load(): Promise<FiolinScript> {
    if (this.url) {
      if (this.setLoadingText) {
        this.setLoadingText(this.url);
      }
      const resp = await fetch(this.url);
      const parsed = await resp.json();
      return parseAs(pFiolinScript, parsed);
    }
    throw new Error('UrlLoader not enabled but .load() called');
  }
}