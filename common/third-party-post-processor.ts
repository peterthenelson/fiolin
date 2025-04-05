import { FiolinRunResponse, PostProcessor } from './types';

export class InvalidFileExtensionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidFileExtensionError';
  }
}

// TODO: Consider scanning zip files too
const BANNED_EXTENSIONS = ['exe', 'com', 'bat', 'ps1', 'dmg', 'iso', 'sh', 'vbs'];

export class ThirdPartyPostProcessor extends PostProcessor {
  constructor() { super(); }

  postProcess(output: FiolinRunResponse): void {
    for (const file of output.outputs) {
      const parts = file.name.split('.');
      const ext: string = (parts.pop() || '').toLowerCase();
      if (BANNED_EXTENSIONS.includes(ext)) {
        throw new InvalidFileExtensionError(
          `Third-party scripts cannot produce outputs of type ${ext}`);
      }
    }
  }
}