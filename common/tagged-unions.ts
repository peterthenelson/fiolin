// Utility to define tag types given a union type
export type ExtractTagType<T> = T extends { type: infer TagType } ? TagType : never;

// Provides a type-safe switch over a union type with a 'type' tag.
export function typeSwitch<T extends { type: string }, V>(input: T, cases: { [K in T['type']]: (input: Extract<T, { type: K }>) => V }): V {
  for (const [k, val] of Object.entries(cases)) {
    if (k === input.type) {
      return (val as (input: unknown) => V)(input);
    }
  }
  throw new Error(`Expected input.type be one of ${Object.keys(cases).join(' | ')}; got ${input.type}`);
}
