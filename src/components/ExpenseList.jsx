import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
};

export default function ExpenseList({ expenses, members }) {
  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';

  if (expenses.length === 0) {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No activity yet.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass-card"
    >
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Recent Activity</h3>
      <motion.div layout variants={container} initial="hidden" animate="show">
        <AnimatePresence>
          {expenses.slice().reverse().map((exp, index) => (
            <motion.div 
              layout
              key={exp.id}
              variants={item}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.9 }}
              className="expense-card"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>{exp.description}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text-main)' }}>{getMemberName(exp.payerId)}</span> paid for {exp.participantIds.length}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="expense-amount" style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                  ₹{(exp.amount).toFixed(2)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
