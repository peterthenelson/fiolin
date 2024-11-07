import { loadAll, loadScript } from '../../utils/config';
import { defineCommand } from 'citty';
import { cpSync, existsSync, mkdirSync, rmSync, watch, writeFileSync } from 'node:fs';
import { FiolinScript } from '../../common/types';
import { pkgPath } from '../../utils/pkg-path';

function pubPath(path: string): string {
  return pkgPath(`server/public/${path}`);
}

function makeFiolHtml(name: string, script: FiolinScript) {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${name} - ƒɪᴏʟɪɴ</title>
    <link rel="stylesheet" href="/index.css">
    <link rel="stylesheet" href="/bundle/host.css">
    <script src="/bundle/host.js" type="module" defer></script>
    <script type="module" defer>
      import { initFiolin } from '/bundle/host.js';
      initFiolin('/s/${name}/script.json');
    </script>
  </head>
  <body>
    <div id="container">
      <div id="script-header">
        <div id="script-title">${script.meta.title}</div>
        <div id="script-mode-button" title="Edit Script">✎</div>
      </div>
      <div id="script">
        <pre id="script-desc">${script.meta.description}</pre>
        <div id="script-editor" class="hidden"></div>
      </div>
      <div id="controls">
        <input type="file" id="file-chooser" disabled />
        <!-- TODO -->
      </div>
      <div id="output">
        <pre id="output-term">Loading...</pre>
      </div>
    </div>
  </body>
</html>
`;
}

function makeIndexHtml(names: Set<string>): string {
  const ns = Array.from(names);
  ns.sort();
  const lis = ns.map((n) => {
    return `<li><a href="/s/${n}/">${n}</a></li>`;
  }).join('\n        ');
  return `<!DOCTYPE html>
<html>
  <head>
    <title>ƒɪᴏʟɪɴ</title>
    <link rel="stylesheet" href="/index.css">
    <link rel="stylesheet" href="/bundle/host.css">
    <script src="/bundle/host.js" type="module" defer></script>
    <script type="module" defer>
      // TODO: Invoke autocomplete when that exists
    </script>
  </head>
  <body>
    <div id="container">
      <h3>First-Party ƒɪᴏʟɪɴ Scripts</h3>
      <ul>
        ${lis}
      </ul>
      <h3>Run A Third-Party Script:</h3>
      <form id="form-3p" action="/third-party/" method="GET">
        <label for="gh">Github user/repo/path-to-fiolin.json</label>
        <input type="text" id="gh" name="gh">
        <label for="url">Alternately, fully specify a URL:</label>
        <input type="text" id="url" name="url">
        <button type="submit">Submit</button>
      </form>
      <h3><a href="/playground/">Create A Script In The Playground</a></h3>
    </div>
  </body>
</html>
`;
}

function genFiol(name: string, options?: { script?: FiolinScript, strict?: boolean }) {
  const dir = pubPath(`s/${name}`);
  const jsonPath = pubPath(`s/${name}/script.json`);
  const htmlPath = pubPath(`s/${name}/index.html`);
  try {
    let script: FiolinScript | undefined = options?.script;
    if (!script) {
      script = loadScript(name);
    }
    console.log(`Generating html/json for ${name}.fiol`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(jsonPath, JSON.stringify(script, null, 2));
    writeFileSync(htmlPath, makeFiolHtml(name, script));
  } catch (e) {
    if (options?.strict) throw e;
    console.error(`Failed to generate json for ${name}.fiol`);
    console.error(e);
    rmSync(dir, { force: true, recursive: true });
  }
}

export default defineCommand({
  meta: {
    name: 'test',
    description: 'Test the given fiolin script using Node',
  },
  args: {
    watch: {
      type: 'boolean',
      description: 'Run in watch mode',
    },
  },
  async run({ args }) {
    const fiolOutputDir = pubPath('s');
    console.log('Recreating directory of generated fiol json');
    rmSync(fiolOutputDir, { force: true, recursive: true });
    mkdirSync(fiolOutputDir);
    const scripts: Record<string, FiolinScript> = await loadAll();
    for (const [name, script] of Object.entries(scripts)) {
      genFiol(name, { script, strict: true });
    }
    const scriptNames = new Set(Object.keys(scripts));
    console.log('Generating index.html');
    writeFileSync(pubPath('index.html'), makeIndexHtml(scriptNames));
    // TODO: switch to chokidar
    if (args.watch) {
      watch(pkgPath('fiols'), { persistent: true, recursive: false }, (type, fileName) => {
        if (!fileName) return;
        if (fileName === 'js.py' || fileName === 'fiolin.py') return;
        let name = '';
        if (fileName.endsWith('.py')) {
          name = fileName.substring(0, fileName.length - 3);
        } else if (fileName.endsWith('.fiol')) {
          name = fileName.substring(0, fileName.length - 5);
        } else {
          return;
        }
        if (type === 'rename') {
          if (existsSync(pkgPath(`fiols/${fileName}`))) {
            console.log(`Fiol added: ${name}`);
            scriptNames.add(name);
            genFiol(name);
          } else {
            console.log(`Fiol removed: ${name}; removing generated html/json`);
            scriptNames.delete(name);
            rmSync(pubPath(`s/${name}`), { force: true, recursive: true });
          }
        } else if (type === 'change') {
          genFiol(name);
        }
        console.log('Generating index.html');
        writeFileSync(pubPath('index.html'), makeIndexHtml(scriptNames));
      });
    }
  },
});
