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

  it('handles null and undefined inputs safely', () => {
    expect(getProp(null, 'missing')).toBeUndefined();
    expect(getProp(undefined, 'missing')).toBeUndefined();
    expect(getPropEntries(null)).toEqual([]);
    expect(getPropEntries(undefined)).toEqual([]);
    expect(getPropSize(null)).toBe(0);
    expect(getPropSize(undefined)).toBe(0);
    expect(toPropObject(null)).toEqual({});
    expect(toPropObject(undefined)).toEqual({});
  });

  it('returns undefined for missing keys', () => {
    expect(getProp(new Map(), 'missing')).toBeUndefined();
    expect(getProp({}, 'missing')).toBeUndefined();
  });

  it('ignores inherited properties on plain objects', () => {
    const proto = { inherited: 'bad' };
    const props = Object.create(proto);
    props.own = 'good';

    expect(getProp(props, 'inherited')).toBeUndefined();
    expect(getProp(props, 'own')).toBe('good');
    expect(getPropEntries(props)).toEqual([['own', 'good']]);
  });

  it('handles empty containers', () => {
    expect(getPropSize(new Map())).toBe(0);
    expect(getPropSize({})).toBe(0);
    expect(getPropEntries(new Map())).toEqual([]);
    expect(getPropEntries({})).toEqual([]);
  });

  it('treats plain objects with helper-like keys as plain objects', () => {
    const props = {
      get: 'not-a-function',
      entries: 'not-a-function',
      size: 0,
      status: 'active',
    };

    expect(getProp(props, 'status')).toBe('active');
    expect(getPropSize(props)).toBe(4);
    expect(getPropEntries(props)).toEqual([
      ['get', 'not-a-function'],
      ['entries', 'not-a-function'],
      ['size', 0],
      ['status', 'active'],
    ]);
  });
});
