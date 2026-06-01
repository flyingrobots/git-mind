/**
 * @module bootstrap
 * Hill 1 semantic bootstrap contract helpers.
 */

export const BOOTSTRAP_NEXT_COMMANDS = [
  'git mind status',
  'git mind nodes',
  'git mind review',
];

/**
 * @typedef {object} BootstrapSummary
 * @property {boolean} dryRun
 * @property {{ scanned: number, byKind: Record<string, number>, skipped: number, warnings: string[] }} artifacts
 * @property {{ created: number, unchanged: number, byPrefix: Record<string, number> }} entities
 * @property {{ created: number, unchanged: number, byType: Record<string, number> }} relationships
 * @property {{ high: number, medium: number, low: number }} confidence
 * @property {{ inferred: number, missing: number }} provenance
 * @property {string[]} warnings
 * @property {string[]} next
 */

/**
 * Create the current bootstrap summary payload.
 *
 * This first slice intentionally exposes the command contract before the
 * scanner/inference pipeline exists. Keeping the payload construction pure
 * makes the dry-run no-write guarantee easy to test and preserves a stable
 * shape for later slices to fill with real counts.
 *
 * @param {{ dryRun?: boolean }} [opts]
 * @returns {BootstrapSummary}
 */
export function createBootstrapSummary(opts = {}) {
  const dryRun = opts.dryRun === true;

  return {
    dryRun,
    artifacts: {
      scanned: 0,
      byKind: {},
      skipped: 0,
      warnings: [],
    },
    entities: {
      created: 0,
      unchanged: 0,
      byPrefix: {},
    },
    relationships: {
      created: 0,
      unchanged: 0,
      byType: {},
    },
    confidence: {
      high: 0,
      medium: 0,
      low: 0,
    },
    provenance: {
      inferred: 0,
      missing: 0,
    },
    warnings: [],
    next: [...BOOTSTRAP_NEXT_COMMANDS],
  };
}
