import { describe, expect, it } from 'vitest';
import { pArr, pBool, pInst, pNum, pObj, pObjWithProps, pOpt, pRec, pStr, pStrLit, pStrUnion, pTaggedUnion, pTuple, parseAs } from './parse';

// Example types for testing parsing
type RGB = 'RED' | 'GREEN' | 'BLUE';
class Super {}
class Sub extends Super {}
interface Tag {
  name: string;
  verified?: boolean;
}
interface Doc {
  title: string;
  wordCounts: Record<string, number>
  tags: Tag[];
}
type Shape = Circle | Rect;
interface Circle { type: 'CIRCLE', radius: number }
interface Rect { type: 'RECT', width: number, height: number }
type XO = 'X' | 'O';
type TicTacToeMove = [number, number, XO];

describe('parsing library', () => {
  describe('basic parsers', () => {
    it('pBool', () => {
      expect(parseAs(pBool, true)).toBe(true);
      expect(parseAs(pBool, false)).toBe(false);
      expect(() => parseAs(pBool, 0)).toThrow();
      expect(() => parseAs(pBool, 'abc')).toThrow();
      expect(() => parseAs(pBool, null)).toThrow();
      expect(() => parseAs(pBool, undefined)).toThrow();
      expect(() => parseAs(pBool, {})).toThrow();
    });
    it('pNum', () => {
      expect(parseAs(pNum, 123)).toEqual(123);
      expect(() => parseAs(pNum, false)).toThrow();
      expect(() => parseAs(pNum, 'abc')).toThrow();
      expect(() => parseAs(pNum, null)).toThrow();
      expect(() => parseAs(pNum, undefined)).toThrow();
      expect(() => parseAs(pNum, {})).toThrow();
    });
    it('pStr', () => {
      expect(parseAs(pStr, 'abc')).toEqual('abc');
      expect(() => parseAs(pStr, false)).toThrow();
      expect(() => parseAs(pStr, 0)).toThrow();
      expect(() => parseAs(pStr, null)).toThrow();
      expect(() => parseAs(pStr, undefined)).toThrow();
      expect(() => parseAs(pStr, {})).toThrow();
    });
    it('pStrLit', () => {
      expect(parseAs(pStrLit('ABC'), 'ABC')).toEqual('ABC');
      expect(() => parseAs(pStrLit('ABC'), false)).toThrow();
      expect(() => parseAs(pStrLit('ABC'), 0)).toThrow();
      expect(() => parseAs(pStrLit('ABC'), null)).toThrow();
      expect(() => parseAs(pStrLit('ABC'), undefined)).toThrow();
      expect(() => parseAs(pStrLit('ABC'), {})).toThrow();
    });
    it('pStrEnum', () => {
      const pRgb = pStrUnion<RGB[]>(['RED', 'GREEN', 'BLUE']);
      expect(parseAs(pRgb, 'RED')).toEqual('RED');
      expect(parseAs(pRgb, 'GREEN')).toEqual('GREEN');
      expect(() => parseAs(pRgb, 'YELLOW')).toThrow();
      expect(() => parseAs(pRgb, false)).toThrow();
      expect(() => parseAs(pRgb, 0)).toThrow();
      expect(() => parseAs(pRgb, null)).toThrow();
      expect(() => parseAs(pRgb, undefined)).toThrow();
      expect(() => parseAs(pRgb, {})).toThrow();
    });
    it('pObj', () => {
      expect(parseAs(pObj, { a: 1, b: 'x' })).toEqual({ a: 1, b: 'x' });
      expect(parseAs(pObj, {})).toEqual({});
      expect(() => parseAs(pObj, false)).toThrow();
      expect(() => parseAs(pObj, 0)).toThrow();
      expect(() => parseAs(pObj, 'abc')).toThrow();
      expect(() => parseAs(pObj, null)).toThrow();
      expect(() => parseAs(pObj, undefined)).toThrow();
    });
  });
  describe('composite parsers', () => {
    it('pArr', () => {
      expect(parseAs(pArr(pNum), [123, 234])).toEqual([123, 234]);
      expect(parseAs(pArr(pNum), [])).toEqual([]);
      expect(() => parseAs(pArr(pNum), ['x', 'y'])).toThrow();
      expect(() => parseAs(pArr(pNum), [123, 'y'])).toThrow();
      expect(() => parseAs(pArr(pNum), {x: 123, y: 234})).toThrow();
    });
    it('pRec', () => {
      expect(parseAs(pRec(pNum), {x: 123, y: 234})).toEqual({x: 123, y: 234});
      expect(parseAs(pRec(pNum), {})).toEqual({});
      // Note: non-string keys just get dropped
      expect(parseAs(pRec(pNum), {x: 123, [Symbol('y')]: 234})).toEqual({x: 123})
      expect(() => parseAs(pRec(pNum), {x: 123, y: false})).toThrow();
      expect(() => parseAs(pRec(pNum), [123, 234])).toThrow();
    });
    it('pOpt', () => {
      expect(parseAs(pOpt(pNum), 123)).toEqual(123);
      expect(parseAs(pOpt(pNum), undefined)).toEqual(undefined);
      expect(() => parseAs(pOpt(pNum), false)).toThrow();
      expect(() => parseAs(pOpt(pNum), 'abc')).toThrow();
      expect(() => parseAs(pOpt(pNum), null)).toThrow();
      expect(() => parseAs(pOpt(pNum), {})).toThrow();
    });
    it('pInst', () => {
      const sup = new Super();
      const sub = new Sub();
      expect(parseAs(pInst(Super), sup)).toEqual(sup);
      expect(parseAs(pInst(Super), sub)).toEqual(sub);
      expect(() => parseAs(pInst(Super), null)).toThrow();
      expect(() => parseAs(pInst(Super), 123)).toThrow();
      expect(() => parseAs(pInst(Super), {})).toThrow();
    });
    it('pObjWithProps', () => {
      const pTag = pObjWithProps<Tag>({
        name: pStr,
        verified: pOpt(pBool),
      });
      const pDoc = pObjWithProps<Doc>({
        title: pStr,
        tags: pArr(pTag),
        wordCounts: pRec(pNum),
      });
      const goodDoc = {
        title: 'Foo',
        tags: [{ name: 'bar' }, { name: 'baz', verified: true }],
        wordCounts: {
          qux: 3,
          foobar: 2
        }
      };
      expect(parseAs(pDoc, goodDoc)).toEqual(goodDoc);
      const docMissingTags = { title: 'Foo', wordCounts: {} };
      expect(() => parseAs(pDoc, docMissingTags)).toThrow();
      const docBadTag = { title: 'Foo', tags: [{ oops: true }], wordCounts: {} };
      expect(() => parseAs(pDoc, docBadTag)).toThrow();
      const docExtra = { title: 'Foo', tags: [], wordCounts: {}, oops: 123 };
      expect(() => parseAs(pDoc, docExtra)).toThrow();
    });
    it('pTaggedUnion', () => {
      const pShape = pTaggedUnion<Shape>({
        'CIRCLE': pObjWithProps({
          'type': pStrLit('CIRCLE'),
          'radius': pNum,
        }),
        'RECT': pObjWithProps({
          'type': pStrLit('RECT'),
          'width': pNum,
          'height': pNum,
        }),
      })
      const circle: Circle = { type: 'CIRCLE', radius: 1 };
      expect(parseAs(pShape, circle)).toEqual(circle);
      const rect: Rect = { type: 'RECT', width: 2, height: 3 };
      expect(parseAs(pShape, rect)).toEqual(rect);
      const badCircle = { type: 'CIRCLE' };
      expect(() => parseAs(pShape, badCircle)).toThrow();
      const badShapeTag = { type: 'SQUARE', sideLength: 4 };
      expect(() => parseAs(pShape, badShapeTag)).toThrow();
      const noShapeTag = { radius: 1 };
      expect(() => parseAs(pShape, noShapeTag)).toThrow();
    });
    it('pTuple', () => {
      const pXO = pStrUnion<XO[]>(['X', 'O']);
      const pTicTacToeMove = pTuple<TicTacToeMove>([pNum, pNum, pXO]);
      const goodMove: TicTacToeMove = [0, 0, 'X'];
      expect(parseAs(pTicTacToeMove, goodMove)).toEqual(goodMove);
      const badMove = [0, 0, '?'];
      expect(() => parseAs(pTicTacToeMove, badMove)).toThrow();
      const tooShort = [0, 0];
      expect(() => parseAs(pTicTacToeMove, tooShort)).toThrow();
      const tooLong = [0, 0, 'X', false];
      expect(() => parseAs(pTicTacToeMove, tooLong)).toThrow();
    });
  });
});
