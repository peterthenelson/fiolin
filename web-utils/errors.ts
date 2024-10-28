
const fallbackMsg = 'Unknown error';

export function toErr(e: unknown): Error {
  if (e instanceof Error) {
    return e;
  } else if (typeof e === 'string') {
    return new Error(e);
  } else {
    console.warn('Expected Error; got:');
    console.warn(e);
    return new Error(fallbackMsg);
  }
}

export function getErrMsg(e: unknown): string {
  if (typeof e === 'object' && e !== null && 'message' in e && typeof e.message === 'string') {
    return e.message;
  } else if (typeof e === 'string') {
    return e;
  }
  console.warn('Expected Error; got:');
  console.warn(e);
  return fallbackMsg;
}
