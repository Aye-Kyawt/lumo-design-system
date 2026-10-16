/**
 * One snapshot of the registry, read by both the component pages and the
 * sidebar so the two can never disagree with each other.
 *
 * This is a SNAPSHOT, not a live read. The site builds on Vercel with no
 * Airtable credentials, so these values are copied by hand from the registry
 * and carry the date they were taken. Every surface that shows them also shows
 * that date — a status that silently goes stale is worse than one that admits
 * how old it is.
 *
 * The registry is the source of truth. When these disagree, the registry wins
 * and this file is wrong.
 */

/** When these values were read from the registry. */
export const asOf = '2026-10-16';

/**
 * @typedef {Object} ComponentStatus
 * @property {string} name      Display name, as the registry's primary field has it
 * @property {string} level     Atomic level, from `Category`
 * @property {string} status    The `Development` formula's current result
 * @property {string|null} verdict  `Release Verdict`, or null when never reviewed
 * @property {number} passed    `Staging Passed Count`
 * @property {number} total     `Total Staging Tests`
 * @property {string} sync      `Synchronization %`
 * @property {boolean} hasPage  Whether this site carries a page for it
 */

/** @type {Record<string, ComponentStatus>} */
export const components = {
  badge:         { name: 'Badge',       level: 'Atoms',     status: 'Released',     verdict: 'Cleared', passed: 5,  total: 5,  sync: '100%',   hasPage: true },
  button:        { name: 'Button',      level: 'Atoms',     status: 'Released',     verdict: 'Cleared', passed: 15, total: 15, sync: '100%',   hasPage: true },
  progress:      { name: 'Progress',    level: 'Atoms',     status: 'Released',     verdict: 'Cleared', passed: 22, total: 22, sync: '100%',   hasPage: true },
  switch:        { name: 'Switch',      level: 'Atoms',     status: 'Completed',    verdict: 'Blocked', passed: 28, total: 28, sync: '100%',   hasPage: true },
  accordion:     { name: 'Accordion',   level: 'Molecules', status: 'To be fixed',  verdict: null,      passed: 16, total: 17, sync: '94.12%', hasPage: true },
  'empty-state': { name: 'Empty State', level: 'Molecules', status: 'Released',     verdict: 'Cleared', passed: 26, total: 26, sync: '100%',   hasPage: true },
  field:         { name: 'Field',       level: 'Molecules', status: 'Completed',    verdict: null,      passed: 16, total: 16, sync: '100%',   hasPage: true },
  toast:         { name: 'Toast',       level: 'Molecules', status: 'To be fixed',  verdict: null,      passed: 17, total: 18, sync: '94.44%', hasPage: true },
  card:          { name: 'Card',        level: 'Organisms', status: 'Released',     verdict: 'Cleared', passed: 28, total: 28, sync: '100%',   hasPage: true },

  // Figma node and a signed-off design, but no code yet — no page here.
  table:         { name: 'Table',       level: 'Organisms', status: 'To-do', verdict: null, passed: 0, total: 0, sync: '0%', hasPage: false },
  calendar:      { name: 'Calendar',    level: 'Organisms', status: 'To-do', verdict: null, passed: 0, total: 0, sync: '0%', hasPage: false },
  'chat-panel':  { name: 'Chat Panel',  level: 'Organisms', status: 'To-do', verdict: null, passed: 0, total: 0, sync: '0%', hasPage: false },
  kanban:        { name: 'Kanban',      level: 'Organisms', status: 'To-do', verdict: null, passed: 0, total: 0, sync: '0%', hasPage: false },
};

/**
 * Which semantic tone a `Development` value carries. Used for chip colour and
 * for the sidebar badge variant.
 */
export function toneFor(status) {
  switch (status) {
    case 'Released':          return 'positive';
    case 'Completed':
    case 'To be deployed':
    case 'Ready for Testing': return 'info';
    case 'To be fixed':
    case 'Fixing':            return 'negative';
    case 'Fixed':             return 'warning';
    default:                  return 'neutral';
  }
}
