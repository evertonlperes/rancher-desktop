import * as array from '@/utils/array';

describe('Array Test', () => {
  test('should remove an Object', () => {
    const dummyArray = ['test', 'dummy'];
    const result = array.removeObject(dummyArray, 'dummy');

    expect(result).toEqual(expect.arrayContaining(['test']));
    expect(result).not.toEqual(expect.arrayContaining(['dummy']));
  });

  test('should remove many Objects', () => {
    const dummyArray = ['test', 'dummy', 'dunno', 'denno'];
    const objs = ['dunno', 'denno'];
    const result = array.removeObjects(dummyArray, objs);

    expect(result).toEqual(expect.arrayContaining(['test', 'dummy']));
    expect(result).not.toEqual(expect.arrayContaining(objs));
  });

  test('should add an Object', () => {
    const dummyArray = ['test', 'dummy', 'dunno', 'denno'];
    const addDummy = 'testing';

    array.addObject(dummyArray, addDummy);

    expect(dummyArray).toEqual(expect.arrayContaining([addDummy]));
  });

  test('should add multiple Objects', () => {
    const dummyArray = ['test', 'dummy', 'dunno', 'denno'];
    const addDummies = ['index4', 'index5'];

    array.addObjects(dummyArray, addDummies);

    expect(dummyArray).toEqual(expect.arrayContaining(addDummies));
  });

  test('should insert an Object into an index', () => {
    const dummyArray = ['test', 'dummy', 'dunno', 'denno'];
    const insertDummy = 'newDummy';

    array.insertAt(dummyArray, 0, insertDummy);

    expect(dummyArray).toContain(insertDummy);
  });

  test('should check if it is an Array', () => {
    const dummyArray = ['test', 'dummy', 'dunno', 'denno'];
    const result = array.isArray(dummyArray);

    expect(result).toBeTruthy();
  });

  test('should remove Objects in a specific index and length', () => {
    const dummyArray = ['test', 'dummy', 'dunno', 'denno'];

    const result = array.removeAt(dummyArray, 1, 2);

    expect(result).toEqual(['test', 'denno']);
  });

  test('should clear the array', () => {
    const dummyArray = ['test', 'dummy', 'dunno', 'denno'];

    array.clear(dummyArray);

    expect(dummyArray).toHaveLength(0);
  });

  test('should replace with a new Object', () => {
    const dummyArray = ['test', 'dummy', 'dunno', 'denno'];
    const newDummyArray = 'dindo';

    array.replaceWith(dummyArray, newDummyArray);

    expect(dummyArray).toEqual(expect.arrayContaining([newDummyArray]));
  });
});
