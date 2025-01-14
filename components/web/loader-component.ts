import { FiolinScript } from '../../common/types';

export abstract class LoaderComponent {
  abstract isEnabled(): boolean;
  abstract load(): Promise<FiolinScript>;
}
