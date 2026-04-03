/**
 * ============================================================
 * DATA MODELS — Smart Expense Splitter
 * ============================================================
 * All data is plain JS objects. No classes, no magic.
 * These are the canonical shapes used throughout the app.
 * ============================================================
 */

/**
 * Creates a new Member object.
 * @param {string} name - Display name of the member
 * @returns {Member}
 */
export function createMember(name) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
  };
}

/**
 * Creates a new Group object.
 * @param {string} name - Display name of the group
 * @param {Member[]} members - Initial list of members
 * @returns {Group}
 */
export function createGroup(name, members = []) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    members,       // Member[]
    expenses: [],  // Expense[]
  };
}

/**
 * Builds a validated Expense input object.
 *
 * splitType is a discriminated union — currently only 'equal' is
 * implemented, but the structure is ready for 'custom' splits:
 *
 *   { type: 'custom', shares: { [memberId]: number } }
 *
 * @param {object} params
 * @param {string}   params.description    - Human-readable label
 * @param {string}   params.payerId        - ID of the member who paid
 * @param {number}   params.amount         - Total amount paid
 * @param {string[]} params.participantIds - IDs of members sharing the cost
 * @param {'equal'}  [params.splitType]    - How to split (default: 'equal')
 * @returns {Expense}
 */
export function createExpense({
  description,
  payerId,
  amount,
  participantIds,
  splitType = 'equal',
}) {
  if (!description?.trim()) throw new Error('Expense description is required.');
  if (!payerId)             throw new Error('Payer is required.');
  if (amount <= 0)          throw new Error('Amount must be greater than zero.');
  if (!participantIds?.length) throw new Error('At least one participant is required.');

  return {
    id: crypto.randomUUID(),
    description: description.trim(),
    payerId,
    amount,
    participantIds,  // string[]
    splitType,       // 'equal' | 'custom' (extensible)
    createdAt: new Date().toISOString(),
  };
}

/**
 * ============================================================
 * TYPE REFERENCE (JSDoc shapes — no TypeScript needed for MVP)
 * ============================================================
 *
 * @typedef {{ id: string, name: string }} Member
 *
 * @typedef {{
 *   id:             string,
 *   description:    string,
 *   payerId:        string,
 *   amount:         number,
 *   participantIds: string[],
 *   splitType:      'equal' | 'custom',
 *   createdAt:      string,
 * }} Expense
 *
 * @typedef {{
 *   id:       string,
 *   name:     string,
 *   members:  Member[],
 *   expenses: Expense[],
 * }} Group
 *
 * @typedef {{
 *   fromId:  string,
 *   toId:    string,
 *   amount:  number,
 * }} DebtSummary
 *
 * ============================================================
 */
