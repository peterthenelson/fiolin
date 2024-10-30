// Brings up the dev server, the fake3p server, and builds/watches the js.
import { ChildProcess, spawn } from 'node:child_process';

function launch(cmd: string, args: string[]): [string, ChildProcess] {
  return [cmd, spawn(cmd, args, { shell: true })];
}

const children = ['watch:ts', 'watch:fiols', 'dev:server', 'dev:fake3p'].map((s) => {
  return launch('npm', ['run', s]);
});

process.on('SIGINT', () => {
  console.log('Stopping processes...');
  for (const [cmd, child] of children) {
    child.kill('SIGTERM');
    child.on('exit', (code) => {
      console.log(`"${cmd}" exited with code ${code}`);
    });
  }
  process.exit();
});

for (const [cmd, child] of children) {
  child.stdout?.on('data', (data) => console.log(data.toString()));
  child.stderr?.on('data', (data) => console.error(data.toString()));
}
