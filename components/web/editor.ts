import { FiolinScript } from '../../common/types';
import { pFiolinScript } from '../../common/parse-script';
import { parseAs, ParseError } from '../../common/parse';
import type { FiolinScriptEditor, FiolinScriptEditorModel } from '../../web-utils/monaco';
import { getByRelIdAs } from '../../web-utils/select-as';
import YAML, { YAMLParseError } from 'yaml';
const monaco = import('../../web-utils/monaco');

export interface EditorCallbacks {
  update(script: FiolinScript, raw: string, model: FiolinScriptEditorModel): Promise<void>;
  updateError(e: unknown): Promise<void>;
}

export class Editor {
  private readonly tabsDiv: HTMLDivElement;
  private readonly editorDiv: HTMLDivElement;
  private readonly cbs: EditorCallbacks;
  private readonly monacoEditor: Promise<FiolinScriptEditor>;
  private script?: FiolinScript;

  constructor(container: HTMLElement, callbacks: EditorCallbacks) {
    this.tabsDiv = getByRelIdAs(container, 'script-editor-tabs', HTMLDivElement);
    this.editorDiv = getByRelIdAs(container, 'script-editor', HTMLDivElement);
    this.cbs = callbacks;
    this.monacoEditor = this.initMonaco();
    this.setUpTabs();
  }

  async setScript(script: FiolinScript): Promise<void> {
    this.script = script;
    (await this.monacoEditor).setScript(script);
  }

  async clearErrors(): Promise<void> {
    (await this.monacoEditor).clearErrors();
  }

  async setError(model: FiolinScriptEditorModel, lineno: number, msg: string): Promise<void> {
    (await this.monacoEditor).setError(model, lineno, msg);
  }

  private async handleScriptUpdate(model: FiolinScriptEditorModel, value: string) {
    if (this.script && model === 'script.py') {
      this.script.code.python = value;
      await this.cbs.update(this.script, value, model);
    } else {
      try {
        const template = YAML.parse(value, { prettyErrors: true });
        const newScript = { code: { python: this.script?.code.python || '' }, ...template };
        this.script = parseAs(pFiolinScript, newScript);
        (await this.monacoEditor).clearErrors();
        await this.cbs.update(this.script, value, model);
      } catch (e) {
        if (e instanceof YAMLParseError && e.linePos) {
          (await this.monacoEditor).setError('script.yml', e.linePos[0].line, e.message);
        } else if (e instanceof ParseError) {
          const lines = value.split(/\n/);
          const field = e.objPath.parts.at(-1);
          const fieldRe = new RegExp(`^\\s*${field}:`);
          for (let i = 0; field && i < lines.length; i++) {
            if (lines[i].match(fieldRe)) {
              (await this.monacoEditor).setError('script.yml', i + 1, e.message);
            }
          }
        } else {
          console.error(e);
        }
        await this.cbs.updateError(e);
      }
    }
  }

  private setUpTabs() {
    this.tabsDiv.onclick = async (event) => {
      if (event.target instanceof HTMLElement && event.target.dataset['model']) {
        const model = event.target.dataset['model'];
        if (model !== 'script.py' && model !== 'script.yml') {
          throw new Error(`Expected data-model to be script.py or script.yml; got ${model}`);
        }
        for (const child of this.tabsDiv.children) {
          child.classList.remove('active');
        }
        event.target.classList.add('active');
        (await this.monacoEditor).switchTab(model);
      }
    };
  }

  private async initMonaco(): Promise<FiolinScriptEditor> {
    return new (await monaco).FiolinScriptEditor(this.editorDiv, async (m, v) => {
      await this.handleScriptUpdate(m, v);
    });
  }
}