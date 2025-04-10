import { OutputValidator, OutputValidationError } from './types';

// TODO: Consider scanning zip files too
const BANNED_EXTENSIONS = ['exe', 'com', 'bat', 'ps1', 'dmg', 'iso', 'sh', 'vbs'];

export class ThirdPartyValidator extends OutputValidator {
  constructor() { super(); }

  validate(outputs: File[]): void {
    for (const file of outputs) {
      const parts = file.name.split('.');
      const ext: string = (parts.pop() || '').toLowerCase();
      if (BANNED_EXTENSIONS.includes(ext)) {
        throw new OutputValidationError(
          `Third-party scripts cannot produce outputs of type ${ext}`);
      }
    }
  }
}