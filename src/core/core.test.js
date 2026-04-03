/**
 * ============================================================
 * UNIT TESTS — Core Expense Logic
 * ============================================================
 * Run with: node --experimental-vm-modules tests/core.test.js
 * Or with Vitest: npx vitest run
 *
 * Tests are grouped by function. Each test documents the
 * scenario in plain English before the assertions.
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { createMember, createGroup } from '../src/core/models.js';
import {
  addExpense,
  calculateBalances,
  simplifyDebts,
  getSettlementSummary,
} from '../src/core/expenseLogic.js';

// ─── Test Fixtures ────────────────────────────────────────────

function makeGroup() {
  const alice = createMember('Alice');
  const bob   = createMember('Bob');
  const carol = createMember('Carol');
  const group = createGroup('Trip', [alice, bob, carol]);
  return { group, alice, bob, carol };
}

// ─── addExpense ───────────────────────────────────────────────

describe('addExpense()', () => {
  it('returns a new group with the expense appended', () => {
    const { group, alice, bob } = makeGroup();

    const updated = addExpense(group, {
      description: 'Dinner',
      payerId: alice.id,
      amount: 300,
      participantIds: [alice.id, bob.id],
    });

    expect(updated.expenses).toHaveLength(1);
    expect(updated.expenses[0].description).toBe('Dinner');
    expect(updated.expenses[0].amount).toBe(300);
  });

  it('does NOT mutate the original group', () => {
    const { group, alice, bob } = makeGroup();

    addExpense(group, {
      description: 'Lunch',
      payerId: alice.id,
      amount: 200,
      participantIds: [alice.id, bob.id],
    });

    expect(group.expenses).toHaveLength(0); // original unchanged
  });

  it('throws if amount is zero or negative', () => {
    const { group, alice, bob } = makeGroup();
    expect(() =>
      addExpense(group, {
        description: 'Bad',
        payerId: alice.id,
        amount: -100,
        participantIds: [alice.id, bob.id],
      })
    ).toThrow('Amount must be greater than zero');
  });

  it('throws if description is empty', () => {
    const { group, alice, bob } = makeGroup();
    expect(() =>
      addExpense(group, {
        description: '',
        payerId: alice.id,
        amount: 100,
        participantIds: [alice.id, bob.id],
      })
    ).toThrow('description is required');
  });
});

// ─── calculateBalances ────────────────────────────────────────

describe('calculateBalances()', () => {
  it('simple 2-person split: payer is owed half', () => {
    const { group, alice, bob } = makeGroup();

    // Alice pays ₹200, split equally between Alice & Bob
    // → Alice net: paid 200, owes 100 → +100
    // → Bob net:   owes 100           → -100
    const updated = addExpense(group, {
      description: 'Coffee',
      payerId: alice.id,
      amount: 200,
      participantIds: [alice.id, bob.id],
    });

    const balances = calculateBalances(updated.members, updated.expenses);

    expect(balances.get(alice.id)).toBeCloseTo(100);
    expect(balances.get(bob.id)).toBeCloseTo(-100);
  });

  it('all members split equally: net balances sum to zero', () => {
    const { group, alice, bob, carol } = makeGroup();

    // Bob pays ₹300 for all three (₹100 each)
    // → Bob net: +300 - 100 = +200
    // → Alice:   -100
    // → Carol:   -100
    const updated = addExpense(group, {
      description: 'Hotel',
      payerId: bob.id,
      amount: 300,
      participantIds: [alice.id, bob.id, carol.id],
    });

    const balances = calculateBalances(updated.members, updated.expenses);
    const total = [...balances.values()].reduce((a, b) => a + b, 0);

    expect(total).toBeCloseTo(0); // always true: money is conserved
    expect(balances.get(bob.id)).toBeCloseTo(200);
    expect(balances.get(alice.id)).toBeCloseTo(-100);
    expect(balances.get(carol.id)).toBeCloseTo(-100);
  });

  it('multiple expenses accumulate correctly', () => {
    const { group, alice, bob } = makeGroup();

    // Expense 1: Alice pays ₹200 for Alice+Bob → Bob owes ₹100
    // Expense 2: Bob pays ₹100 for Alice+Bob  → Alice owes ₹50
    // Net: Bob owes Alice 100-50 = ₹50
    let g = addExpense(group, {
      description: 'Lunch',
      payerId: alice.id,
      amount: 200,
      participantIds: [alice.id, bob.id],
    });
    g = addExpense(g, {
      description: 'Coffee',
      payerId: bob.id,
      amount: 100,
      participantIds: [alice.id, bob.id],
    });

    const balances = calculateBalances(g.members, g.expenses);
    expect(balances.get(alice.id)).toBeCloseTo(50);
    expect(balances.get(bob.id)).toBeCloseTo(-50);
  });

  it('returns zero balance for members with no expenses', () => {
    const { group, carol } = makeGroup();
    // No expenses added
    const balances = calculateBalances(group.members, group.expenses);
    expect(balances.get(carol.id)).toBe(0);
  });
});

// ─── simplifyDebts ────────────────────────────────────────────

describe('simplifyDebts()', () => {
  it('simple case: one debtor, one creditor', () => {
    const balances = new Map([
      ['alice', 100],
      ['bob', -100],
    ]);
    const result = simplifyDebts(balances);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ fromId: 'bob', toId: 'alice', amount: 100 });
  });

  it('two debtors, one creditor', () => {
    // Alice is owed ₹200; Bob owes ₹150; Carol owes ₹50
    const balances = new Map([
      ['alice', 200],
      ['bob', -150],
      ['carol', -50],
    ]);
    const result = simplifyDebts(balances);

    expect(result).toHaveLength(2);

    const bobTx   = result.find((t) => t.fromId === 'bob');
    const carolTx = result.find((t) => t.fromId === 'carol');

    expect(bobTx).toMatchObject({ toId: 'alice', amount: 150 });
    expect(carolTx).toMatchObject({ toId: 'alice', amount: 50 });
  });

  it('consolidates: minimizes transaction count', () => {
    // Without simplification, a 3-way chain (A→B, B→C, A→C) needs 3 txns.
    // With simplification it should need at most 2.
    const balances = new Map([
      ['alice', 300],
      ['bob', -100],
      ['carol', -200],
    ]);
    const result = simplifyDebts(balances);
    // Should be 2: bob→alice 100, carol→alice 200
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('handles already-settled group (all zero balances)', () => {
    const balances = new Map([
      ['alice', 0],
      ['bob', 0],
    ]);
    expect(simplifyDebts(balances)).toHaveLength(0);
  });

  it('all transaction amounts are positive', () => {
    const balances = new Map([
      ['alice', 150],
      ['bob', -80],
      ['carol', -70],
    ]);
    const result = simplifyDebts(balances);
    result.forEach((t) => expect(t.amount).toBeGreaterThan(0));
  });

  it('balances sum to zero after all settlements', () => {
    const balances = new Map([
      ['alice', 500],
      ['bob', -200],
      ['carol', -300],
    ]);
    const transactions = simplifyDebts(balances);

    // Replay transactions: verify net is zero
    const net = new Map(balances);
    for (const { fromId, toId, amount } of transactions) {
      net.set(fromId, (net.get(fromId) ?? 0) + amount);
      net.set(toId, (net.get(toId) ?? 0) - amount);
    }
    for (const val of net.values()) {
      expect(Math.abs(val)).toBeLessThan(0.01);
    }
  });
});

// ─── getSettlementSummary (integration) ───────────────────────

describe('getSettlementSummary()', () => {
  it('full pipeline: 3 friends, 2 expenses', () => {
    const { group, alice, bob, carol } = makeGroup();

    // Alice pays ₹600 dinner for all → each owes ₹200, Alice net +400
    // Carol pays ₹300 taxi for Bob & Carol → each owes ₹150, Carol net +150
    let g = addExpense(group, {
      description: 'Dinner',
      payerId: alice.id,
      amount: 600,
      participantIds: [alice.id, bob.id, carol.id],
    });
    g = addExpense(g, {
      description: 'Taxi',
      payerId: carol.id,
      amount: 300,
      participantIds: [bob.id, carol.id],
    });

    const { balances, transactions } = getSettlementSummary(g);

    // Expected net balances — worked out step by step:
    //
    // Expense 1 — Dinner (₹600, paid by Alice, split 3 ways = ₹200 each):
    //   Alice:  paid 600, owes 200  → +400
    //   Bob:    owes 200            → -200
    //   Carol:  owes 200            → -200
    //
    // Expense 2 — Taxi (₹300, paid by Carol, split between Bob & Carol = ₹150 each):
    //   Carol:  paid 300, owes 150  → +150
    //   Bob:    owes 150            → -150
    //
    // Final net (summing both expenses):
    //   Alice:  +400
    //   Bob:    -200 + -150 = -350
    //   Carol:  -200 + +150 = -50   ← owes more from dinner than she recovered from taxi
    expect(balances.get(bob.id)).toBeCloseTo(-350);
    expect(balances.get(alice.id)).toBeCloseTo(400);
    expect(balances.get(carol.id)).toBeCloseTo(-50);

    // All transactions go in the right direction (from debtor to creditor)
    transactions.forEach(({ fromId, toId }) => {
      expect(balances.get(fromId)).toBeLessThan(0);
      expect(balances.get(toId)).toBeGreaterThan(0);
    });
  });
});
