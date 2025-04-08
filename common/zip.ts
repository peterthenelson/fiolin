import { zip, AsyncZipOptions, AsyncZippable }  from 'fflate';

async function toZippable(pathAndContents: [string, ArrayBuffer | Promise<ArrayBuffer>][]): Promise<AsyncZippable> {
  const root: AsyncZippable = {};
  for (const [path, content] of pathAndContents) {
    let bytes: Uint8Array;
    if (content instanceof Promise) {
      bytes = new Uint8Array(await content);
    } else {
      bytes = new Uint8Array(content);
    }
    const parts = path.split('/');
    let currentDir = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in currentDir)) {
        currentDir[part] = {};
      }
      currentDir = currentDir[part] as AsyncZippable;
    }
    const fileName = parts[parts.length - 1];
    currentDir[fileName] = bytes;
  }
  return root;
}

function zipAsync(data: AsyncZippable, opts: AsyncZipOptions): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    zip(data, opts, (err, data) => {
      if (err !== null) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export async function zipFilesRaw(pathAndContents: [string, ArrayBuffer | Promise<ArrayBuffer>][]): Promise<File> {
  const bytes = await zipAsync(await toZippable(pathAndContents), {});
  return new File([bytes], 'output.zip');
}

export async function zipFiles(files: File[]): Promise<File> {
  return zipFilesRaw(files.map((f) => [f.name, f.arrayBuffer()]));
}
