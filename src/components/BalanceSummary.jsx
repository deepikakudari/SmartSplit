import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } } };

export default function BalanceSummary({ balances, transactions, members, expenses, onSettle }) {
  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';
  
  const balanceEntries = balances ? Array.from(balances.entries()) : [];
  const settlementHistory = expenses.filter(e => e.description.includes('Settlement'));

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card"
      style={{ position: 'sticky', top: '2rem' }}
    >
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Balances</h4>
        
        {(balanceEntries.length === 0 || balanceEntries.every(([_, amount]) => Math.abs(amount) < 0.01)) && (
           <motion.p layout style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Smart Contract settled.</motion.p>
        )}
        
        <motion.div layout variants={container} initial="hidden" animate="show">
          <AnimatePresence mode="popLayout">
            {balanceEntries.map(([memberId, amount]) => {
              if (Math.abs(amount) < 0.01) return null;
              const isOwed = amount > 0;
              return (
                <motion.div layout key={memberId} variants={itemAnim} initial="hidden" animate="show" exit={{ scale: 0.8, opacity: 0 }} className={`balance-card ${isOwed ? 'positive' : 'negative'}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isOwed ? 'var(--positive-text)' : 'var(--negative-text)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {getMemberName(memberId).charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.05rem' }}>{getMemberName(memberId)}</div>
                      <div style={{ fontSize: '0.8rem', color: isOwed ? 'var(--positive-text)' : 'var(--negative-text)' }}>{isOwed ? 'Gets Back' : 'Owes'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', fontSize: '1.2rem', color: isOwed ? 'var(--positive-text)' : 'var(--negative-text)' }}>
                     ₹<AnimatedNumber value={Math.abs(amount)} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.div layout style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding Debts</h4>
        {transactions.length === 0 ? (
           <motion.p layout style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No signatures required.</motion.p>
        ) : (
          <motion.div layout variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence mode="popLayout">
              {transactions.map((tx, index) => (
                <motion.div layout key={`${tx.fromId}-${tx.toId}-${index}`} variants={itemAnim} initial="hidden" animate="show" exit={{ scale: 0.8, opacity: 0, x: -20 }} className="expense-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                       <div className="tx-chip tx-chip-negative">{getMemberName(tx.fromId)}</div>
                       <ArrowRight size={16} color="var(--text-muted)" />
                       <div className="tx-chip tx-chip-positive">{getMemberName(tx.toId)}</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace' }}>₹<AnimatedNumber value={tx.amount} /></span>
                      <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(74, 222, 128, 0.4)' }} whileTap={{ scale: 0.95 }} onClick={() => onSettle(tx)} className="btn" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)', fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: '12px' }}>
                        <CheckCircle2 size={16} color="#4ade80" /> Settle
                      </motion.button>
                    </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {settlementHistory.length > 0 && (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cleared Settlements Log</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {settlementHistory.slice().reverse().map(exp => (
                  <motion.div layout key={exp.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'white', fontWeight: 600 }}>{getMemberName(exp.payerId)}</span> settled debt with <span style={{ color: 'white', fontWeight: 600 }}>{getMemberName(exp.participantIds[0])}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#4ade80' }}>
                      ₹{exp.amount.toFixed(2)}
                    </div>
                  </motion.div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
