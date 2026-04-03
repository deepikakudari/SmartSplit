import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

export default function MemberModal({ member, expenses, balances, transactions, members, onClose }) {
  if (!member) return null;

  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';

  const memberExpenses = useMemo(() => {
    return expenses.filter(exp => 
      exp.payerId === member.id || exp.participantIds.includes(member.id)
    );
  }, [expenses, member.id]);

  const { totalPaid, totalConsumed } = useMemo(() => {
    let paid = 0;
    let consumed = 0;
    memberExpenses.forEach(exp => {
      const isSettlement = exp.description.includes('Settlement');
      const isPayer = exp.payerId === member.id;
      const isParticipant = exp.participantIds.includes(member.id);
      const splitAmount = exp.amount / exp.participantIds.length;

      if (isPayer && !isSettlement) paid += exp.amount;
      if (isParticipant && !isSettlement) consumed += splitAmount;
    });
    return { totalPaid: paid, totalConsumed: consumed };
  }, [memberExpenses, member.id]);

  const myNetBalance = balances ? balances.get(member.id) || 0 : 0;
  
  const myDebts = transactions.filter(tx => tx.fromId === member.id); 
  const myCredits = transactions.filter(tx => tx.toId === member.id); 

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
      }}
      onClick={onClose}
    >
      <motion.div 
        layout
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '500px',
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          color: 'white', position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div layout style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', border: '3px solid rgba(255,255,255,0.2)' }}>
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem', margin: 0, letterSpacing: '-0.02em' }}>{member.name}</h2>
              <span style={{ color: myNetBalance > 0 ? 'var(--positive-text)' : myNetBalance < 0 ? 'var(--negative-text)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {myNetBalance > 0 ? `Net: Gets ₹${myNetBalance.toFixed(2)}` : myNetBalance < 0 ? `Net: Owes ₹${Math.abs(myNetBalance).toFixed(2)}` : 'Net: Settled Up'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </motion.div>

        <AnimatePresence>
          {(myDebts.length > 0 || myCredits.length > 0) && (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: '2rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Active Debts</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {myDebts.map((tx, i) => (
                    <motion.div layout key={`debt-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                       <span style={{ color: 'var(--negative-text)' }}>You owe {getMemberName(tx.toId)}</span>
                       <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>₹{tx.amount.toFixed(2)}</span>
                    </motion.div>
                  ))}
                  {myCredits.map((tx, i) => (
                    <motion.div layout key={`cred-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                       <span style={{ color: 'var(--positive-text)' }}>{getMemberName(tx.fromId)} owes you</span>
                       <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>₹{tx.amount.toFixed(2)}</span>
                    </motion.div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
               <TrendingUp size={14} color="var(--positive-text)" /> Total Funded
             </div>
             <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: 'white' }}>₹<AnimatedNumber value={totalPaid} /></div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
               <TrendingDown size={14} color="var(--negative-text)" /> Total Consumed
             </div>
             <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: 'white' }}>₹<AnimatedNumber value={totalConsumed} /></div>
          </div>
        </motion.div>

        <motion.h3 layout style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Full History</motion.h3>
        {memberExpenses.length === 0 ? (
          <motion.div layout style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Receipt size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No activity yet.</p>
          </motion.div>
        ) : (
          <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {memberExpenses.slice().reverse().map((exp) => {
              const isPayer = exp.payerId === member.id;
              const isParticipant = exp.participantIds.includes(member.id);
              const splitAmount = exp.amount / exp.participantIds.length;
              const isSettlement = exp.description.includes('Settlement');

              let titleMarkup = "";
              let subMarkup = "";
              let highlightColor = 'white';
              let amountDisplay = exp.amount;

              if (isSettlement) {
                if (isPayer) {
                  titleMarkup = `Paid off debt`;
                  subMarkup = `To ${getMemberName(exp.participantIds[0])}`;
                  highlightColor = 'var(--text-muted)';
                } else {
                  titleMarkup = `Received settlement`;
                  subMarkup = `From ${getMemberName(exp.payerId)}`;
                  highlightColor = 'var(--text-muted)';
                }
              } else {
                if (isPayer && isParticipant) {
                  titleMarkup = `You funded this`;
                  subMarkup = `Total: ₹${exp.amount.toFixed(2)} • Share: ₹${splitAmount.toFixed(2)}`;
                  highlightColor = 'var(--positive-text)';
                } else if (isPayer && !isParticipant) {
                  titleMarkup = `You paid for others`;
                  subMarkup = `Total: ₹${exp.amount.toFixed(2)} • Consumed ₹0`;
                  highlightColor = 'var(--positive-text)';
                } else if (!isPayer && isParticipant) {
                  titleMarkup = `${getMemberName(exp.payerId)} paid`;
                  subMarkup = `Your split cost: ₹${splitAmount.toFixed(2)}`;
                  highlightColor = 'var(--negative-text)';
                  amountDisplay = splitAmount;
                }
              }

              return (
                <motion.div layout key={exp.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>{exp.description}</div>
                    <div style={{ fontSize: '0.85rem', color: highlightColor, fontWeight: 600, marginBottom: '2px' }}>{titleMarkup}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subMarkup}</div>
                  </div>
                  <div style={{ fontWeight: '800', fontFamily: 'monospace', fontSize: '1.2rem', color: isSettlement ? 'var(--text-muted)' : 'white' }}>
                    ₹{amountDisplay.toFixed(2)}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
