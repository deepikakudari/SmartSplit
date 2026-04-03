import React, { useState } from 'react';
import { PlusCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddExpenseForm({ members, onSubmit }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState(members[0]?.id || '');
  const [participantIds, setParticipantIds] = useState(members.map(m => m.id));
  const [isSuccess, setIsSuccess] = useState(false);

  const handleToggleParticipant = (id) => {
    setParticipantIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || !payerId || participantIds.length === 0) return;

    onSubmit({
      description,
      amount: parseFloat(amount),
      payerId,
      participantIds
    });

    // Upgraded soundless feedback (Longer fade, profound pulse)
    setIsSuccess(true);
    setTimeout(() => {
      setDescription('');
      setAmount('');
      setIsSuccess(false);
    }, 1500); 
  };

  return (
    <motion.form 
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card" 
      onSubmit={handleSubmit}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <h3 className="glass-card-title" style={{ marginBottom: '1.5rem', fontWeight: 800 }}>
        Add Expense
      </h3>

      <div className="input-group">
        <label className="input-label">Description</label>
        <input 
          className="input-field" 
          placeholder="What was this for? (e.g. Dinner)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label className="input-label">Amount (₹)</label>
        <input 
          type="number"
          step="0.01"
          min="0"
          className="input-field" 
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          style={{ fontSize: '1.25rem', fontFamily: 'monospace' }}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Paid By</label>
        <select 
          className="input-field"
          value={payerId}
          onChange={e => setPayerId(e.target.value)}
          required
        >
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="input-group" style={{ marginBottom: '1.5rem' }}>
        <label className="input-label">Split Among</label>
        <motion.div layout className="checkbox-grid">
          {members.map(m => {
            const isSelected = participantIds.includes(m.id);
            return (
              <motion.div 
                layout
                key={m.id} 
                className={`checkbox-label ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggleParticipant(m.id)}
              >
                <motion.div
                  layout
                  animate={{ scale: isSelected ? 1 : 0.9 }}
                  style={{
                    width: '18px', height: '18px', 
                    borderRadius: '6px', 
                    background: isSelected ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle size={14} color="white" /></motion.div>}
                </motion.div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? 'var(--primary-color)' : 'var(--text-main)' }}>
                  {m.name}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit" 
        className="btn btn-primary" 
        style={{ width: '100%', height: '3.5rem' }}
        disabled={participantIds.length === 0}
      >
        <PlusCircle size={20} />
        Split Bill
      </motion.button>

      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, scale: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, scale: 1.05, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(99, 102, 241, 0.4)', // Slightly deeper tint
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', zIndex: 100,
              boxShadow: 'inset 0 0 100px rgba(99, 102, 241, 0.5)'
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1, rotate: [0, 10, -10, 0] }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <CheckCircle size={80} color="white" />
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '1.5rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
            >
              Split Complete!
            </motion.h3>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
