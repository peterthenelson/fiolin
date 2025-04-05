import JSZip from 'jszip';

// TODO: Make this work with folders
export async function zipFilesRaw(pathAndContents: [string, Promise<ArrayBuffer>][]): Promise<File> {
  const zip = new JSZip();
  for (const [path, bufPromise] of pathAndContents) {
    zip.file(path, bufPromise)
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], 'output.zip');
}

export async function zipFiles(files: File[]): Promise<File> {
  return zipFilesRaw(files.map((f) => [f.name, f.arrayBuffer()]));
}
