import * as array from '@/utils/array';

describe('Array', () => {
  test('should remove an Object', async() => {
    const dummyArray = ['test', 'dummy'];
    const test = await array.removeObject(dummyArray, 'dummy');

    expect(test).toEqual(expect.arrayContaining(['test']));
    expect(test).not.toEqual(expect.arrayContaining(['dummy']));
  });
});
