/**
 * Deferred<T> is like a Promise<T> that can be created independently of the
 * logic for resolving/rejecting it. At some later time, it can be manually
 * resolved/rejected. For example:
 * 
 *   const magicWord = new Deferred<string>();
 * 
 *   // Async functions can block on the resolution:
 *   async sayMagicWord() {
 *     const mw = await magicWord.promise;
 *     alert(`The magic word that was selected is ${mw}`);
 *   }
 *   sayMagicWord();
 * 
 *   // Multiple different ways of resolving it can be hooked up later on.
 *   // Whichever happens first will trigger the blocked function.
 *   manuallySpecifyMagicWordForm.onsubmit = (event) => {
 *     const fd = new FormData(manuallySpecifyMagicWordForm);
 *     magicWord.resolve(fd.get('magicWord'));
 *   }
 *   autoGenMagicWordButton.onclick = () => {
 *     magicWord.resolve(randomWord());
 *   }
 */
export class Deferred<T> {
  public readonly promise: Promise<T>;
  private _resolve?: (value: T | PromiseLike<T>) => void;
  private _reject?: (reason?: any) => void;
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
  resolve(value: T | PromiseLike<T>) {
    if (!this._resolve) throw new Error('_resolve not set!');
    this._resolve(value);
  }
  reject(reason?: any) {
    if (!this._reject) throw new Error('_reject not set!');
    this._reject(reason);
  }
}
