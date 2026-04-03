/**
 * ============================================================
 * CORE LOGIC — Smart Expense Splitter
 * ============================================================
 * All functions are PURE:
 *   - No side effects
 *   - Same input always produces same output
 *   - Do not mutate arguments
 *
 * This makes them trivial to unit-test and safe to use in
 * any state management system (useState, Zustand, Redux, etc.)
 * ============================================================
 */

import { createExpense } from './models.js';

// ─────────────────────────────────────────────────────────────
// 1. addExpense
// ─────────────────────────────────────────────────────────────

/**
 * Adds a new expense to a group. Returns a NEW group object
 * (does not mutate the original).
 *
 * @param {Group}  group        - The current group state
 * @param {object} expenseInput - Raw expense input (see createExpense)
 * @returns {Group}             - New group with the expense appended
 *
 * @example
 *   const updated = addExpense(group, {
 *     description: 'Dinner',
 *     payerId: 'alice-id',
 *     amount: 600,
 *     participantIds: ['alice-id', 'bob-id', 'carol-id'],
 *   });
 */
export function addExpense(group, expenseInput) {
  const expense = createExpense(expenseInput);

  return {
    ...group,
    expenses: [...group.expenses, expense],
  };
}

// ─────────────────────────────────────────────────────────────
// 2. calculateBalances
// ─────────────────────────────────────────────────────────────

/**
 * Computes the net balance for every member across all expenses.
 *
 * Algorithm:
 *   For each expense:
 *     - The payer's balance increases by the full amount
 *       (they are owed this money)
 *     - Each participant's balance decreases by their share
 *       (they owe this money)
 *
 * A positive balance means the member is OWED money.
 * A negative balance means the member OWES money.
 *
 * @param {Member[]}  members  - All members in the group
 * @param {Expense[]} expenses - All expenses in the group
 * @returns {Map<string, number>} memberId → net balance (in ₹)
 *
 * @example
 *   // Alice paid ₹300 for Alice + Bob
 *   // → Alice: +150 (paid 300, owes 150) → net +150
 *   // → Bob:   -150 (owes 150)
 */
export function calculateBalances(members, expenses) {
  // Initialize every member with a zero balance
  const balances = new Map(members.map((m) => [m.id, 0]));

  for (const expense of expenses) {
    const { payerId, amount, participantIds, splitType } = expense;

    // --- Compute each participant's share ---
    const shares = computeShares(amount, participantIds, splitType);

    // The payer is credited the full amount
    balances.set(payerId, (balances.get(payerId) ?? 0) + amount);

    // Each participant is debited their share
    for (const [participantId, share] of Object.entries(shares)) {
      balances.set(participantId, (balances.get(participantId) ?? 0) - share);
    }
  }

  return balances;
}

/**
 * Computes how much each participant owes for a single expense.
 * Isolated here so custom split types can be added cleanly later.
 *
 * @param {number}   amount         - Total expense amount
 * @param {string[]} participantIds - Members sharing the cost
 * @param {string}   splitType      - 'equal' | 'custom'
 * @returns {{ [memberId: string]: number }}
 */
function computeShares(amount, participantIds, splitType) {
  if (splitType === 'equal') {
    // Round each share to 2 decimal places to avoid floating-point
    // artifacts like 33.3333... appearing in balances and UI displays.
    // Note: rounding means shares may not sum to *exactly* `amount`
    // (e.g. ₹100 / 3 → 3 × 33.33 = 99.99 not 100). This is a standard
    // trade-off in financial apps; the 1-paisa discrepancy is dropped.
    // A production system would assign the remainder to the payer.
    const share = parseFloat((amount / participantIds.length).toFixed(2));
    return Object.fromEntries(participantIds.map((id) => [id, share]));
  }

  // ── Custom split (not yet implemented) ──────────────────────────────
  // Currently only 'equal' is supported. The structure is intentionally
  // designed to support 'custom' splits in a future iteration:
  //
  //   expense.splitType = 'custom'
  //   expense.shares    = { 'alice-id': 400, 'bob-id': 200 }
  //
  // To add it: handle the 'custom' case here and pass `expense.shares`
  // directly as the return value. No other function needs to change.
  throw new Error(`Unsupported split type: "${splitType}"`);
}

// ─────────────────────────────────────────────────────────────
// 3. simplifyDebts
// ─────────────────────────────────────────────────────────────

/**
 * Reduces a set of net balances into the MINIMUM number of
 * transactions needed to settle all debts.
 *
 * Algorithm — Greedy Creditor/Debtor Matching:
 *   1. Separate members into creditors (balance > 0) and
 *      debtors (balance < 0).
 *   2. Sort both groups by absolute value (largest first).
 *   3. Match the biggest debtor with the biggest creditor:
 *        - If debtor owes MORE than creditor is owed:
 *            creditor is fully settled, debtor still owes the difference
 *        - If debtor owes LESS:
 *            debtor is fully settled, creditor is partially paid
 *        - If equal: both are fully settled in one transaction
 *   4. Repeat until all balances are zero.
 *
 * This is O(n log n) and produces near-optimal results for
 * the common case. (Exact minimum is NP-hard in the general case.)
 *
 * @param {Map<string, number>} balances - Output of calculateBalances()
 * @returns {DebtSummary[]}              - List of { fromId, toId, amount }
 *
 * @example
 *   // Input:  Alice +200, Bob -150, Carol -50
 *   // Output: [{ from: Bob, to: Alice, amount: 150 },
 *   //          { from: Carol, to: Alice, amount: 50 }]
 */
export function simplifyDebts(balances) {
  const EPSILON = 0.001; // ignore floating-point dust (e.g., 0.00000001)

  // Separate into mutable creditor/debtor lists
  // Use plain objects so we can decrement them as we settle
  const creditors = []; // people who are owed money (balance > 0)
  const debtors   = []; // people who owe money     (balance < 0)

  for (const [id, balance] of balances.entries()) {
    if (balance > EPSILON)  creditors.push({ id, amount: balance });
    if (balance < -EPSILON) debtors.push({ id, amount: -balance }); // store as positive
  }

  // Sort largest first — greedy matching works best this way
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];

  let ci = 0; // creditor pointer
  let di = 0; // debtor pointer

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor   = debtors[di];

    // The settled amount is the smaller of what's owed / what's due
    const settled = Math.min(creditor.amount, debtor.amount);

    transactions.push({
      fromId: debtor.id,    // debtor pays
      toId:   creditor.id,  // creditor receives
      amount: parseFloat(settled.toFixed(2)),
    });

    creditor.amount -= settled;
    debtor.amount   -= settled;

    // Advance the pointer whose balance just hit zero
    if (creditor.amount < EPSILON) ci++;
    if (debtor.amount   < EPSILON) di++;
  }

  return transactions;
}

// ─────────────────────────────────────────────────────────────
// 4. Convenience: getSettlementSummary
// ─────────────────────────────────────────────────────────────

/**
 * One-shot helper that runs the full pipeline:
 *   expenses → net balances → simplified debt transactions
 *
 * Returns everything needed to render the UI.
 *
 * @param {Group} group
 * @returns {{
 *   balances:     Map<string, number>,
 *   transactions: DebtSummary[],
 * }}
 */
export function getSettlementSummary(group) {
  const balances     = calculateBalances(group.members, group.expenses);
  const transactions = simplifyDebts(balances);
  return { balances, transactions };
}
