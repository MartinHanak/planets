import { sum, product } from './index';

test('sums 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('product 1 and 2 to equal 2', () => {
    expect(product(1, 2)).toBe(2);
  });