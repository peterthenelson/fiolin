import { OutputValidator, ValidateOutputError } from './types';

// TODO: Consider scanning zip files too
const BANNED_EXTENSIONS = ['exe', 'com', 'bat', 'ps1', 'dmg', 'iso', 'sh', 'vbs'];

export class ThirdPartyOutputValidator extends OutputValidator {
  constructor() { super(); }

  validate(file: File): void {
    const parts = file.name.split('.');
    const ext: string = (parts.pop() || '').toLowerCase();
    if (BANNED_EXTENSIONS.includes(ext)) {
      throw new ValidateOutputError(`Third-party scripts cannot produce outputs of type ${ext}`);
    }
  }
}