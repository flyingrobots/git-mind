/**
 * @module review
 * Review decisions and provenance for git-mind.
 * Stores decisions as decision: prefixed nodes in the graph.
 */

import { createHash } from 'node:crypto';
import { isLowConfidence, validateEdge } from './validators.js';
import { getProp } from './prop-bag.js';

const VALID_REVIEW_ACTIONS = new Set(['accept', 'reject', 'adjust', 'skip']);

/**
 * @typedef {object} PendingSuggestion
 * @property {string} source - Source node ID
 * @property {string} target - Target node ID
 * @property {string} type - Edge label
 * @property {number} confidence
 * @property {string} [rationale]
 * @property {string} [createdAt]
 */

/**
 * @typedef {object} ReviewDecision
 * @property {string} id - Decision node ID
 * @property {'accept'|'reject'|'adjust'|'skip'} action
 * @property {string} source
 * @property {string} target
 * @property {string} edgeType
 * @property {number} confidence
 * @property {string} [rationale]
 * @property {number} timestamp
 * @property {string} [reviewer]
 */

/**
 * Generate a unique decision node ID from edge components.
 *
 * @param {string} source
 * @param {string} target
 * @param {string} type
 * @returns {string}
 */
function makeDecisionId(source, target, type) {
  const hash = createHash('sha256')
    .update(`${source}|${target}|${type}`)
    .digest('hex')
    .slice(0, 8);
  const epoch = Math.floor(Date.now() / 1000);
  return `decision:${epoch}-${hash}`;
}

/**
 * Add a decision node to a pending patch.
 *
 * @param {object} patch
 * @param {ReviewDecision} decision
 */
function addDecisionToPatch(patch, decision) {
  patch.addNode(decision.id);
  patch.setProperty(decision.id, 'action', decision.action);
  patch.setProperty(decision.id, 'source', decision.source);
  patch.setProperty(decision.id, 'target', decision.target);
  patch.setProperty(decision.id, 'edgeType', decision.edgeType);
  patch.setProperty(decision.id, 'confidence', decision.confidence);
  patch.setProperty(decision.id, 'timestamp', decision.timestamp);
  if (decision.rationale) {
    patch.setProperty(decision.id, 'rationale', decision.rationale);
  }
  if (decision.reviewer) {
    patch.setProperty(decision.id, 'reviewer', decision.reviewer);
  }
}

/**
 * Fetch all decision-node IDs and their properties from the graph.
 *
 * @param {import('@git-stunts/git-warp').default} graph
 * @returns {Promise<Array<{ id: string, props: import('./prop-bag.js').PropBag }>>}
 */
async function fetchDecisionProps(graph) {
  const nodes = await graph.getNodes();
  const decisionNodes = nodes.filter(n => n.startsWith('decision:'));
  const propsResults = await Promise.all(decisionNodes.map(id => graph.getNodeProps(id)));
  return decisionNodes.map((id, i) => ({ id, props: propsResults[i] }));
}

/**
 * Get pending suggestions: low-confidence edges that haven't been reviewed yet.
 *
 * @param {import('@git-stunts/git-warp').default} graph
 * @returns {Promise<PendingSuggestion[]>}
 */
export async function getPendingSuggestions(graph) {
  const edges = await graph.getEdges();
  const lowConf = edges.filter(isLowConfidence);

  if (lowConf.length === 0) return [];

  // Find reviewed edge keys from decision nodes
  const reviewedKeys = new Set();
  for (const { props: propsMap } of await fetchDecisionProps(graph)) {
    if (!propsMap) continue;
    const source = getProp(propsMap, 'source');
    const target = getProp(propsMap, 'target');
    const edgeType = getProp(propsMap, 'edgeType');
    if (source && target && edgeType) {
      reviewedKeys.add(`${source}|${target}|${edgeType}`);
    }
  }

  return lowConf
    .filter(e => !reviewedKeys.has(`${e.from}|${e.to}|${e.label}`))
    .map(e => ({
      source: e.from,
      target: e.to,
      type: e.label,
      confidence: e.props?.confidence ?? 0,
      rationale: e.props?.rationale,
      createdAt: e.props?.createdAt,
    }));
}

/**
 * Accept a suggestion: promote edge confidence to 1.0, record decision.
 * Assumes single-writer: the edge must still exist when called.
 * If the edge was concurrently deleted, setEdgeProperty will throw.
 *
 * @param {import('@git-stunts/git-warp').default} graph
 * @param {PendingSuggestion} suggestion
 * @param {{ reviewer?: string }} [opts={}]
 * @returns {Promise<ReviewDecision>}
 */
export async function acceptSuggestion(graph, suggestion, opts = {}) {
  const decision = {
    id: makeDecisionId(suggestion.source, suggestion.target, suggestion.type),
    action: 'accept',
    source: suggestion.source,
    target: suggestion.target,
    edgeType: suggestion.type,
    confidence: 1.0,
    rationale: suggestion.rationale,
    timestamp: Math.floor(Date.now() / 1000),
    reviewer: opts.reviewer,
  };

  const patch = await graph.createPatch();
  patch.setEdgeProperty(suggestion.source, suggestion.target, suggestion.type, 'confidence', 1.0);
  patch.setEdgeProperty(suggestion.source, suggestion.target, suggestion.type, 'reviewedAt', new Date().toISOString());
  addDecisionToPatch(patch, decision);
  await patch.commit();
  return decision;
}

/**
 * Reject a suggestion: remove the low-confidence edge, record decision.
 *
 * @param {import('@git-stunts/git-warp').default} graph
 * @param {PendingSuggestion} suggestion
 * @param {{ reviewer?: string }} [opts={}]
 * @returns {Promise<ReviewDecision>}
 */
export async function rejectSuggestion(graph, suggestion, opts = {}) {
  const decision = {
    id: makeDecisionId(suggestion.source, suggestion.target, suggestion.type),
    action: 'reject',
    source: suggestion.source,
    target: suggestion.target,
    edgeType: suggestion.type,
    confidence: suggestion.confidence,
    rationale: suggestion.rationale,
    timestamp: Math.floor(Date.now() / 1000),
    reviewer: opts.reviewer,
  };

  const patch = await graph.createPatch();
  patch.removeEdge(suggestion.source, suggestion.target, suggestion.type);
  addDecisionToPatch(patch, decision);
  await patch.commit();
  return decision;
}

/**
 * Adjust a suggestion: update edge props, record decision.
 * Assumes single-writer: the edge must still exist when called.
 *
 * @param {import('@git-stunts/git-warp').default} graph
 * @param {PendingSuggestion} original
 * @param {{ type?: string, confidence?: number, rationale?: string, reviewer?: string }} adjustments
 * @returns {Promise<ReviewDecision>}
 */
export async function adjustSuggestion(graph, original, adjustments = {}) {
  const newType = adjustments.type ?? original.type;
  const newConf = adjustments.confidence ?? original.confidence;
  const rationale = adjustments.rationale ?? original.rationale;
  const validation = validateEdge(original.source, original.target, newType, newConf);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }
  for (const warning of validation.warnings) {
    console.warn(`[git-mind] ${warning}`);
  }

  const reviewedAt = new Date().toISOString();
  const decision = {
    id: makeDecisionId(original.source, original.target, original.type),
    action: 'adjust',
    source: original.source,
    target: original.target,
    edgeType: newType,
    confidence: newConf,
    rationale,
    timestamp: Math.floor(Date.now() / 1000),
    reviewer: adjustments.reviewer,
  };

  const patch = await graph.createPatch();
  if (newType !== original.type) {
    patch.addEdge(original.source, original.target, newType);
    patch.setEdgeProperty(original.source, original.target, newType, 'confidence', newConf);
    patch.setEdgeProperty(original.source, original.target, newType, 'createdAt', reviewedAt);
    patch.setEdgeProperty(original.source, original.target, newType, 'reviewedAt', reviewedAt);
    if (rationale) {
      patch.setEdgeProperty(original.source, original.target, newType, 'rationale', rationale);
    }
    patch.removeEdge(original.source, original.target, original.type);
  } else {
    patch.setEdgeProperty(original.source, original.target, original.type, 'confidence', newConf);
    if (adjustments.rationale) {
      patch.setEdgeProperty(original.source, original.target, original.type, 'rationale', adjustments.rationale);
    }
    patch.setEdgeProperty(original.source, original.target, original.type, 'reviewedAt', reviewedAt);
  }

  addDecisionToPatch(patch, decision);
  await patch.commit();
  return decision;
}

/**
 * Skip a suggestion: defers the decision without persisting.
 * Skipped items intentionally remain pending and will reappear in future
 * review sessions, allowing the reviewer to revisit them later.
 *
 * @param {PendingSuggestion} suggestion
 * @returns {ReviewDecision}
 */
export function skipSuggestion(suggestion) {
  return {
    id: makeDecisionId(suggestion.source, suggestion.target, suggestion.type),
    action: 'skip',
    source: suggestion.source,
    target: suggestion.target,
    edgeType: suggestion.type,
    confidence: suggestion.confidence,
    rationale: suggestion.rationale,
    timestamp: Math.floor(Date.now() / 1000),
  };
}

/**
 * Get review history from decision nodes in the graph.
 *
 * @param {import('@git-stunts/git-warp').default} graph
 * @param {{ action?: string }} [filter={}]
 * @returns {Promise<ReviewDecision[]>}
 */
export async function getReviewHistory(graph, filter = {}) {
  const decisions = [];
  for (const { id, props: propsMap } of await fetchDecisionProps(graph)) {
    if (!propsMap) continue;

    const action = getProp(propsMap, 'action');
    const source = getProp(propsMap, 'source');
    const target = getProp(propsMap, 'target');
    const edgeType = getProp(propsMap, 'edgeType');
    const confidence = getProp(propsMap, 'confidence');
    const timestamp = getProp(propsMap, 'timestamp');

    if (
      !VALID_REVIEW_ACTIONS.has(action) ||
      typeof source !== 'string' ||
      source.length === 0 ||
      typeof target !== 'string' ||
      target.length === 0 ||
      typeof edgeType !== 'string' ||
      edgeType.length === 0 ||
      !Number.isFinite(confidence) ||
      !Number.isFinite(timestamp)
    ) {
      continue;
    }

    if (filter.action && action !== filter.action) continue;

    decisions.push({
      id,
      action,
      source,
      target,
      edgeType,
      confidence,
      rationale: getProp(propsMap, 'rationale'),
      timestamp,
      reviewer: getProp(propsMap, 'reviewer'),
    });
  }

  return decisions.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
}

/**
 * Apply a batch decision to all pending suggestions.
 *
 * @param {import('@git-stunts/git-warp').default} graph
 * @param {'accept'|'reject'} action
 * @param {{ reviewer?: string }} [opts={}]
 * @returns {Promise<{ processed: number, decisions: ReviewDecision[] }>}
 */
export async function batchDecision(graph, action, opts = {}) {
  if (action !== 'accept' && action !== 'reject') {
    throw new Error(`Invalid batch action: ${action}. Must be "accept" or "reject".`);
  }
  const pending = await getPendingSuggestions(graph);
  const decisions = [];

  if (pending.length === 0) {
    return { processed: 0, decisions };
  }

  const patch = await graph.createPatch();
  for (const suggestion of pending) {
    const decision = {
      id: makeDecisionId(suggestion.source, suggestion.target, suggestion.type),
      action,
      source: suggestion.source,
      target: suggestion.target,
      edgeType: suggestion.type,
      confidence: action === 'accept' ? 1.0 : suggestion.confidence,
      rationale: suggestion.rationale,
      timestamp: Math.floor(Date.now() / 1000),
      reviewer: opts.reviewer,
    };

    if (action === 'accept') {
      patch.setEdgeProperty(suggestion.source, suggestion.target, suggestion.type, 'confidence', 1.0);
      patch.setEdgeProperty(suggestion.source, suggestion.target, suggestion.type, 'reviewedAt', new Date().toISOString());
    } else {
      patch.removeEdge(suggestion.source, suggestion.target, suggestion.type);
    }

    addDecisionToPatch(patch, decision);
    decisions.push(decision);
  }
  await patch.commit();

  return { processed: decisions.length, decisions };
}
