import React, { useState } from 'react';
import { Users, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';
import MemberModal from './MemberModal';

export default function GroupOverview({ name, members, totalExpenses, expenses, balances, transactions, onAddMember }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const colors = [
    'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #f43f5e 0%, #f97316 100%)',
    'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
    'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
  ];

  const handleSubmitNewMember = (e) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      onAddMember(newMemberName.trim());
      setNewMemberName('');
      setIsAdding(false);
    }
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card"
        style={{ padding: '2rem' }}
      >
        <motion.div layout className="glass-card-header" style={{ marginBottom: '0.5rem' }}>
          <h2 className="glass-card-title">
            <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', display: 'flex' }}>
               <Users size={24} color="var(--primary-color)" />
            </div>
            {name}
          </h2>
          
          <div style={{ textAlign: 'right' }}>
            <p className="input-label" style={{ marginBottom: '4px', fontSize: '0.8rem' }}>Total Split</p>
            <div style={{ color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              ₹<AnimatedNumber value={totalExpenses} />
            </div>
          </div>
        </motion.div>
        
        <motion.div layout>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Guests ({members.length})</h3>
           </div>
           
           <motion.div layout style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', zIndex: 50, position: 'relative' }}>
              <motion.div layout className="avatar-group" style={{ zIndex: 60 }}>
                <AnimatePresence mode="popLayout">
                  {members.map((member, i) => (
                    <motion.button 
                      layout
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring' }}
                      key={member.id} 
                      className="avatar"
                      title={member.name}
                      onClick={() => setSelectedMember(member)}
                      whileHover={{ scale: 1.15, y: -5, zIndex: 90, boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
                      whileTap={{ scale: 0.9 }}
                      style={{ background: colors[i % colors.length], cursor: 'pointer', border: '2px solid #0f172a', padding: 0 }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>

              <motion.div layout style={{ position: 'relative', zIndex: 40 }}>
                <AnimatePresence mode="wait">
                  {!isAdding ? (
                    <motion.button
                      layout
                      key="btn-add"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAdding(true)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px dashed rgba(255,255,255,0.2)',
                        color: 'white',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <Plus size={18} />
                    </motion.button>
                  ) : (
                    <motion.form 
                      layout
                      key="form-add"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      onSubmit={handleSubmitNewMember}
                      style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '24px' }}
                    >
                      <input 
                        autoFocus
                        placeholder="Name..."
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: 'transparent', color: 'white', outline: 'none' }}
                      />
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="submit"
                        style={{
                          background: 'var(--primary-color)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          boxShadow: 'var(--shadow-glow)'
                        }}
                      >
                        <Check size={14} />
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
           </motion.div>
           
           <motion.p layout style={{ textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', marginLeft: '0.5rem' }}>
            Click on a passenger to view their personal debts and history.
          </motion.p>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedMember && (
          <MemberModal 
            member={selectedMember} 
            expenses={expenses} 
            balances={balances}
            transactions={transactions}
            members={members}
            onClose={() => setSelectedMember(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
