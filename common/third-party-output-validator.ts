import { OutputValidator, ValidateOutputError } from './types';

// TODO: Figure out a good list
const BANNED_EXTENSIONS = ['exe', 'com', 'bat', 'ps1', 'dmg', 'iso', 'sh'];

// TODO: Wire into runner and test
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