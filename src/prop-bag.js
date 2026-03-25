/**
 * @module prop-bag
 * Compatibility helpers for git-warp node property bag shapes.
 *
 * Older git-warp releases returned Map instances from getNodeProps().
 * Newer releases return plain objects. Git Mind supports both here.
 */

/**
 * @typedef {Map<string, unknown> | Record<string, unknown> | null | undefined} PropBag
 */

/**
 * Read a property value from a property bag.
 *
 * @param {PropBag} props
 * @param {string} key
 * @returns {unknown}
 */
export function getProp(props, key) {
  if (!props) return undefined;
  if (props instanceof Map) {
    return props.get(key);
  }
  return Object.prototype.hasOwnProperty.call(props, key) ? props[key] : undefined;
}

/**
 * Return all entries from a property bag.
 *
 * @param {PropBag} props
 * @returns {Array<[string, unknown]>}
 */
export function getPropEntries(props) {
  if (!props) return [];
  if (props instanceof Map) {
    return [...props.entries()];
  }
  return Object.entries(props);
}

/**
 * Count entries in a property bag.
 *
 * @param {PropBag} props
 * @returns {number}
 */
export function getPropSize(props) {
  if (!props) return 0;
  if (props instanceof Map) {
    return props.size;
  }
  return Object.keys(props).length;
}

/**
 * Convert a property bag to a plain object.
 *
 * @param {PropBag} props
 * @returns {Record<string, unknown>}
 */
export function toPropObject(props) {
  return Object.fromEntries(getPropEntries(props));
}
