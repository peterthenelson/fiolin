import { FiolinComponent } from './fiolin-component';
const monaco = import('./monaco');

function getElementByIdAs<T extends HTMLElement>(id: string, cls: new (...args: any[])=> T): T {
  const elem = document.getElementById(id);
  if (elem === null) {
    throw new Error(`Element #${id} not found`);
  } else if (elem instanceof cls) {
    return (elem as T);
  } else {
    throw new Error(`Element #${id} is not an instance of ${cls}`);
  }
}

export function initFiolin(scriptUrl?: string, loading?: boolean): FiolinComponent {
  const container = document.getElementById('container');
  if (container === null) {
    die('#container not present; cannot initFiolin');
  }
  return new FiolinComponent(container, scriptUrl, loading);
}

async function colorizeLang(lang: string): Promise<void> {
  const readyMonaco = await monaco;
  await Promise.all(Array.from(
    document.querySelectorAll(`code.language-${lang}`),
    (e) => readyMonaco.colorize(e as HTMLElement, lang)
  ));
}

export async function colorizeExamples(): Promise<void> {
  await Promise.all([
    colorizeLang('py'), colorizeLang('json'), colorizeLang('sh')
  ]);
}

export function die(msg: string): never {
  const scriptDesc = getElementByIdAs('script-desc', HTMLPreElement);
  scriptDesc.textContent = msg;
  throw new Error(msg);
}
