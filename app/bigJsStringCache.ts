// eslint-disable-next-line import/no-named-as-default
import Big from 'big.js';

const bigCache = new Map<string, Big>();

export function getBig(value: string | number) {
  const key = String(value);
  if (!bigCache.has(key)) {
    bigCache.set(key, new Big(value));
  }
  return bigCache.get(key)!;
}
