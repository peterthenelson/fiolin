import { FiolinComponent } from './fiolin-component';
const monaco = import('./monaco');

export function initFiolin(scriptUrl?: string, showLoading?: boolean): FiolinComponent {
  const container = document.getElementById('container');
  if (container === null) {
    die('#container not present; cannot initFiolin');
  }
  return new FiolinComponent(container, { scriptUrl, showLoading });
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
  const scriptDesc = document.querySelector('[data-rel-id="script-desc"]');
  if (scriptDesc === null) {
    console.warn('Failed to find [data-rel-id="script-desc"]');
  } else if (!(scriptDesc instanceof HTMLPreElement)) {
    console.warn('Script description element not <pre> as expected');
  } else {
    scriptDesc.textContent = msg;
  }
  throw new Error(msg);
}
