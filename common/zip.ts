import JSZip from 'jszip';

function folders(paths: string[]): string[] {
  const dirs = new Set<string>();
  for (const path of paths) {
    const parts = path.split('/');
    for (let i = 0; i < parts.length - 1; i++) {
      const dirPath = parts.slice(0, i + 1).join('/');
      dirs.add(dirPath);
    }
  };
  return Array.from(dirs);
}

export async function zipFilesRaw(pathAndContents: [string, Promise<ArrayBuffer>][]): Promise<File> {
  const zip = new JSZip();
  for (const dir of folders(pathAndContents.map((x) => x[0]))) {
    zip.folder(dir);
  }
  for (const [path, bufPromise] of pathAndContents) {
    zip.file(path, bufPromise)
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], 'output.zip');
}

export async function zipFiles(files: File[]): Promise<File> {
  return zipFilesRaw(files.map((f) => [f.name, f.arrayBuffer()]));
}
