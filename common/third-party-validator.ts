import { OutputValidator, OutputValidationError } from './types';

const BANNED_EXTENSIONS = [
  '7z',
  'apk',
  'app',
  'bat',
  'bz2',
  'cab',
  'com',
  'dll',
  'dmg',
  'elf',
  'exe',
  'gz',
  'iso',
  'msi',
  'ocx',
  'ps1',
  'rar',
  'scr',
  'sh',
  'so',
  'tgz',
  'vbs',
  'zip',
];

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