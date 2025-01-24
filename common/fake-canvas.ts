import { ICanvasRenderingContext2D } from './types';

export class DummyCanvasRenderingContext2D implements ICanvasRenderingContext2D {
  private called: boolean;
  private readonly onFirstCall: () => void;
  constructor(onFirstCall: () => void) {
    this.called = false;
    this.onFirstCall = onFirstCall;
  }

  private f() {
    if (this.called) return;
    this.onFirstCall();
    this.called = true;
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean = false): void { this.f() }
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void { this.f() }
  beginPath(): void { this.f() }
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void { this.f() }
  clearRect(x: number, y: number, width: number, height: number): void { this.f() }
  clip(path?: unknown, fillRule?: unknown): void { this.f(); }
  closePath(): void { this.f() }
  createConicGradient(startAngle: number, x: number, y: number): CanvasGradient { this.f(); return new CanvasGradient(); }
  createImageData(sw: unknown, sh?: unknown, settings?: unknown): ImageData { this.f(); return new ImageData(1,1); }
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient { this.f(); return new CanvasGradient(); }
  createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null { this.f(); return null; }
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient { this.f(); return new CanvasGradient(); }
  drawFocusIfNeeded(path: unknown, element?: unknown): void { this.f(); }
  drawImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, sx: number, sy: number, sWidth?: number, sHeight?: number, dx?: number, dy?: number, dWidth?: number, dHeight?: number): void { this.f() }
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void { this.f(); }
  fill(): void { this.f() }
  fillRect(x: number, y: number, width: number, height: number): void { this.f() }
  fillText(text: string, x: number, y: number, maxWidth?: number): void { this.f() }
  getImageData(sx: number, sy: number, sw: number, sh: number, settings?: ImageDataSettings): ImageData { this.f(); return new ImageData(1,1); }
  getLineDash(): number[] { this.f(); return []; }
  getTransform(): DOMMatrix { this.f(); return new DOMMatrix(); }
  isContextLost(): boolean { this.f(); return false; }
  isPointInPath(path: unknown, x: unknown, y?: unknown, fillRule?: unknown): boolean { this.f(); return false; }
  isPointInStroke(path: unknown, x: unknown, y?: unknown): boolean { this.f(); return false; }
  lineTo(x: number, y: number): void { this.f() }
  measureText(text: string): TextMetrics { this.f(); return new TextMetrics(); }
  moveTo(x: number, y: number): void { this.f() }
  putImageData(imagedata: unknown, dx: unknown, dy: unknown, dirtyX?: unknown, dirtyY?: unknown, dirtyWidth?: unknown, dirtyHeight?: unknown): void { this.f(); }
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void { this.f(); }
  rect(x: number, y: number, w: number, h: number): void { this.f(); }
  reset(): void { this.f(); }
  resetTransform(): void { this.f() }
  restore(): void { this.f() }
  rotate(angle: number): void { this.f() }
  roundRect(x: unknown, y: unknown, w: unknown, h: unknown, radii?: unknown): void { this.f(); }
  save(): void { this.f() }
  scale(x: number, y: number): void { this.f() }
  setFillStyle(style: string | CanvasGradient | CanvasPattern): void { this.f() }
  setLineCap(cap: CanvasLineCap): void { this.f() }
  setLineDash(segments: unknown): void { this.f(); }
  setLineJoin(join: CanvasLineJoin): void { this.f() }
  setLineWidth(width: number): void { this.f() }
  setMiterLimit(limit: number): void { this.f() }
  setStrokeStyle(style: string | CanvasGradient | CanvasPattern): void { this.f() }
  setTransform(a?: number | DOMMatrix2DInit, b?: number, c?: number, d?: number, e?: number, f?: number): void { this.f() }
  stroke(): void { this.f() }
  strokeRect(x: number, y: number, width: number, height: number): void { this.f() }
  strokeText(text: string, x: number, y: number, maxWidth?: number): void { this.f() }
  transform(a: number, b: number, c: number, d: number, e: number, f: number): void { this.f(); }
  translate(x: number, y: number): void { this.f() }
  direction: CanvasDirection = 'inherit';
  fillStyle: string | CanvasGradient | CanvasPattern = '#000';
  filter: string = '';
  font: string = 'foo';
  fontKerning: CanvasFontKerning = 'auto';
  fontStretch: CanvasFontStretch = 'normal';
  fontVariantCaps: CanvasFontVariantCaps = 'normal';
  globalAlpha: number = 1;
  globalCompositeOperation: GlobalCompositeOperation = 'source-over';
  imageSmoothingEnabled: boolean = true;
  imageSmoothingQuality: ImageSmoothingQuality = 'low';
  letterSpacing: string = '';
  lineCap: CanvasLineCap = 'round';
  lineDashOffset: number = 0;
  lineJoin: CanvasLineJoin = 'round';
  lineWidth: number = 1;
  miterLimit: number = 10;
  shadowBlur: number = 0;
  shadowColor: string = 'rgba(0, 0, 0, 0)';
  shadowOffsetX: number = 0;
  shadowOffsetY: number = 0;
  strokeStyle: string | CanvasGradient | CanvasPattern = '#000';
  textAlign: CanvasTextAlign = 'start';
  textBaseline: CanvasTextBaseline = 'alphabetic';
  textRendering: CanvasTextRendering = 'auto';
  wordSpacing: string = '';
}
