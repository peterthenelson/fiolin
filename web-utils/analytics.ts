// Lazy-loads /analytics/lib.js at runtime. The URL is stored in a variable
// so rollup does not try to resolve or bundle it. Events fired before the
// import settles are queued; on success they are flushed to the real sender,
// on failure (local dev, worker unreachable, CSP, etc.) they are logged to
// the console so it's visible that analytics would have fired.

type SendFn = (name: string) => void;

const pending: string[] = [];
let impl: SendFn | null = null;

const analyticsUrl = '/analytics/lib.js';
import(analyticsUrl).then((mod) => {
  impl = mod.sendEvent as SendFn;
  for (const name of pending.splice(0)) impl(name);
}).catch(() => {
  impl = (name) => console.log(`[analytics] ${name}`);
  for (const name of pending.splice(0)) impl(name);
});

export function sendEvent(name: string): void {
  if (impl) {
    impl(name);
  } else {
    pending.push(name);
  }
}
