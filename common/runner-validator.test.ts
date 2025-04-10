import { describe, expect, it } from 'vitest';
import { mkRunner, mkScript } from './runner-test-util';
import { ThirdPartyValidator } from './third-party-validator';

describe('PyodideRunner output validation', () => {
  it('blocks dangerous extensions when enabled', async () => {
    const runner = mkRunner({ validators: [new ThirdPartyValidator() ] });
    const script = mkScript(`
      import fiolin
      with open('/output/foo.exe', 'w') as f:
        f.write('asdf')
    `);
    const response = await runner.run(script, { inputs: [] });
    expect(response.error).not.toBeUndefined();
    expect(response.error?.message).toMatch(
      /Third-party scripts cannot produce outputs of type exe/);
    expect(response.outputs.length).toEqual(0);
  });

  it ('allows normal extensions when enabled', async () => {
    const runner = mkRunner({ validators: [new ThirdPartyValidator() ] });
    const script = mkScript(`
      import fiolin
      with open('/output/foo.txt', 'w') as f:
        f.write('asdf')
    `);
    const response = await runner.run(script, { inputs: [] });
    expect(response.error).toBeUndefined();
    expect(response.outputs.length).toEqual(1);
  });

  it('blocks manually constructed zip files', async () => {
    const runner = mkRunner({ validators: [new ThirdPartyValidator() ] });
    const script = mkScript(`
      import fiolin
      with open('/output/foo.zip', 'w') as f:
        f.write('asdf')
    `);
    const response = await runner.run(script, { inputs: [] });
    expect(response.error).not.toBeUndefined();
    expect(response.error?.message).toMatch(
      /Third-party scripts cannot produce outputs of type zip/);
    expect(response.outputs.length).toEqual(0);
  });

  it('allows autozipping', async () => {
    const runner = mkRunner({ validators: [new ThirdPartyValidator() ] });
    const script = mkScript(`
      import fiolin
      with open('/output/foo.txt', 'w') as f:
        f.write('asdf')
      fiolin.zip_outputs()
    `);
    const response = await runner.run(script, { inputs: [] });
    expect(response.error).toBeUndefined();
    expect(response.outputs.map((f) => f.name)).toEqual(['output.zip']);
  });
});
