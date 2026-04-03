import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addExpense, getSettlementSummary } from './core/expenseLogic';
import { createMember } from './core/models';

import SetupScreen from './components/SetupScreen';
import GroupOverview from './components/GroupOverview';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseList from './components/ExpenseList';
import BalanceSummary from './components/BalanceSummary';

export default function App() {
  const [group, setGroup] = useState(null);

  const totalExpenses = useMemo(() => {
    if (!group) return 0;
    return group.expenses
      .filter(exp => !exp.description.includes('Settlement')) // Keep accurate filtering
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [group]);

  const { balances, transactions } = useMemo(() => {
    if (!group) return { balances: null, transactions: [] };
    return getSettlementSummary(group);
  }, [group]);

  const handleAddExpense = (expenseInput) => {
    const updatedGroup = addExpense(group, expenseInput);
    setGroup(updatedGroup);
  };

  const handleSettleUp = (tx) => {
    handleAddExpense({
      description: `Settlement: Cleared debt`,
      payerId: tx.fromId,
      amount: tx.amount,
      participantIds: [tx.toId]
    });
  };

  const handleAddMember = (name) => {
    const newMember = createMember(name);
    setGroup(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  return (
    <AnimatePresence mode="wait">
      {!group ? (
        <motion.div 
          key="setup"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          transition={{ duration: 0.4 }}
          className="app-container" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
        >
          <SetupScreen onComplete={setGroup} />
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="app-container"
        >
          <div className="main-content">
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
              style={{ marginBottom: '1rem', paddingTop: '1rem' }}
            >
              <h1 style={{ fontSize: '3rem', color: 'white', margin: 0, textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                SplitSmart
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
                Cost splitting, simplified.
              </p>
            </motion.header>

            <GroupOverview 
              name={group.name} 
              members={group.members} 
              totalExpenses={totalExpenses} 
              expenses={group.expenses} 
              balances={balances}
              transactions={transactions}
              onAddMember={handleAddMember}
            />

            <AddExpenseForm 
              members={group.members} 
              onSubmit={handleAddExpense} 
            />

            <ExpenseList 
              expenses={group.expenses} 
              members={group.members} 
            />
          </div>

          <div className="sidebar">
            <BalanceSummary 
              balances={balances} 
              transactions={transactions} 
              members={group.members} 
              expenses={group.expenses}
              onSettle={handleSettleUp}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
