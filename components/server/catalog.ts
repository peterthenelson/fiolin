import { loadAll } from '../../utils/config';
import { redent } from '../../common/indent';
import { FiolinScript } from '../../common/types';

function renderEntry(id: string, script: FiolinScript, numSpaces: number): string {
  return redent(`
    <div class="catalog-entry">
      <div class="catalog-title"><a href="/s/${id}/">${script.meta.title}</a></div>
      <div class="catalog-desc">${script.meta.description}</div>
    </div>
  `, ' '.repeat(numSpaces));
}

function renderEntries(scripts: Record<string, FiolinScript>, numSpaces: number): string {
  return Object.entries(scripts).map(([id, script]) => renderEntry(id, script, numSpaces)).join('\n');
}

export async function renderCatalog(numSpaces?: number) {
  const scripts = await loadAll();
  return redent(`
    <div class="container">
      <a href="/" class="plain-link"><h1>ƒ<span class="home-io">ɪᴏ</span>ʟɪɴ</h1></a>
      <div class="home-subtitle">Your files belong to you.</div>
      <div class="home-text">
        Easily convert between file formats, combine PDFs, and more.
        Unlike other websites, your files stay on your computer!
      </div>
      <div class="catalog flex-col-wrap">
        ${renderEntries(scripts, (numSpaces || 0) + 4)}
      </div>
      <div class="home-footer home-text">
        Are you a software developer? Write and share your own fiolin
        scripts. Get started with the <a href="/playground/">tutorial</a> or
        <a href="/doc">read the docs</a>.
      </div>
    </div>
  `, ' '.repeat(numSpaces || 0));
}
