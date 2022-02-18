import * as array from '@/utils/array';

describe('Array', () => {
  test('should remove an Object', async() => {
    const dummyArray = ['test', 'dummy'];
    const result = await array.removeObject(dummyArray, 'dummy');

    expect(result).toEqual(expect.arrayContaining(['test']));
    expect(result).not.toEqual(expect.arrayContaining(['dummy']));
  });

  test('should remove many Objects', async() => {
    const dummyArray = ['test', 'dummy', 'dunno', 'denno'];
    const objs = ['dunno', 'denno'];
    const result = await array.removeObjects(dummyArray, objs);

    expect(result).toEqual(expect.arrayContaining(['test', 'dummy']));
    expect(result).not.toEqual(expect.arrayContaining(['dunno', 'denno']));
  });
});
