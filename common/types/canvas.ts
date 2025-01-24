// Interface for CanvasRenderingContext2D (minus the reference to canvas, the
// rendering context settings, and the drawFocusIfNeeded stuff).
export interface ICanvasRenderingContext2D extends
  CanvasCompositing, CanvasDrawImage, CanvasDrawPath, CanvasFillStrokeStyles,
  CanvasFilters, CanvasImageData, CanvasImageSmoothing, CanvasPath,
  CanvasPathDrawingStyles, CanvasRect, CanvasShadowStyles, CanvasState,
  CanvasText, CanvasTextDrawingStyles, CanvasTransform {}
