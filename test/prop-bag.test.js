import { describe, it, expect } from 'vitest';
import { getProp, getPropEntries, getPropSize, toPropObject } from '../src/prop-bag.js';

describe('prop-bag', () => {
  it('supports Map-like property bags', () => {
    const props = new Map([
      ['status', 'active'],
      ['priority', 'high'],
    ]);

    expect(getProp(props, 'status')).toBe('active');
    expect(getPropSize(props)).toBe(2);
    expect(getPropEntries(props)).toEqual([
      ['status', 'active'],
      ['priority', 'high'],
    ]);
    expect(toPropObject(props)).toEqual({
      status: 'active',
      priority: 'high',
    });
  });

  it('supports object-like property bags', () => {
    const props = {
      status: 'active',
      priority: 'high',
    };

    expect(getProp(props, 'status')).toBe('active');
    expect(getPropSize(props)).toBe(2);
    expect(getPropEntries(props)).toEqual([
      ['status', 'active'],
      ['priority', 'high'],
    ]);
    expect(toPropObject(props)).toEqual(props);
  });
});
