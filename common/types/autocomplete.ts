import { FiolinScriptMeta } from './fiolin-script';

export interface AutocompleteSuggestion {
  id: string;
  link: string;
  meta: FiolinScriptMeta;
}