import utils from '../src/utils';

describe('utils.replaceSpaces', () => {
  test('replaces spaces with underscores and reverts', () => {
    const input = [{ 'My Field': 'value' }];
    const withUnderscore = utils.replaceSpaces(input);
    expect(withUnderscore[0]).toHaveProperty('My_Field', 'value');

    const reverted = utils.replaceSpaces(withUnderscore, true);
    expect(reverted[0]).toHaveProperty('My Field', 'value');
  });
});

// Basic test for getQueryFields

describe('utils.getQueryFields', () => {
  test('returns query string with replaced spaces', () => {
    const result = utils.getQueryFields(['Field One', 'SecondField']);
    expect(result).toBe('?fields=Field_One,SecondField');
  });
});
