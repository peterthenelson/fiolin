import { describe, expect, it, vi } from 'vitest';
import { mkErrorMessage } from './types';
import { parseAs } from '../common/parse';
import { pErrorMessage } from './parse-msg';

class TestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TestError';
  }
}

// Canvas doesn't work in node
global.OffscreenCanvas = vi.fn().mockImplementation((width: number, height: number) => {
  return {
    height,
    width,
    oncontextlost: jest.fn(),
    oncontextrestored: jest.fn(),
    getContext: jest.fn(() => undefined),
    convertToBlob: jest.fn(),
    transferToImageBitmap: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  } as unknown as OffscreenCanvas;
});

describe('worker message error serialization', () => {
  it('works with built-in errors', async () => {
    {
      const init = new Error('foo');
      const em = mkErrorMessage(init);
      const final = parseAs(pErrorMessage, structuredClone(em)).error;
      expect(final.name).toEqual('Error');
    }
    {
      const init = new TypeError('foo');
      const em = mkErrorMessage(init);
      const final = parseAs(pErrorMessage, structuredClone(em)).error;
      expect(final.name).toEqual('TypeError');
    }
  });

  it('preserves name for custom errors', async () => {
    const init = new TestError('foo');
    const em = mkErrorMessage(init);
    const final = parseAs(pErrorMessage, structuredClone(em)).error;
    expect(final.name).toEqual('TestError');
  });
});
