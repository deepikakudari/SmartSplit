import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ArrowRight, Wallet } from 'lucide-react';
import { createGroup, createMember } from '../core/models';

export default function SetupScreen({ onComplete }) {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([{ id: 1, name: '' }, { id: 2, name: '' }]);

  const handleAddMember = () => {
    setMembers([...members, { id: Date.now(), name: '' }]);
  };

  const handleRemoveMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleNameChange = (id, newName) => {
    setMembers(members.map(m => m.id === id ? { ...m, name: newName } : m));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validMembers = members.filter(m => m.name.trim() !== '');
    if (!groupName.trim() || validMembers.length < 2) return;

    const domainMembers = validMembers.map(m => createMember(m.name.trim()));
    const finalGroup = createGroup(groupName.trim(), domainMembers);
    onComplete(finalGroup);
  };

  const validCount = members.filter(m => m.name.trim() !== '').length;
  const isValid = groupName.trim() !== '' && validCount >= 2;

  // Reusable sticker styling
  const getStickerStyle = (top, right, bottom, left) => ({
    position: 'absolute',
    top, right, bottom, left,
    background: 'white',
    padding: '8px',
    borderRadius: '12px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
    fontSize: '3rem',
    zIndex: 50,
    border: '4px solid white',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none'
  });

  return (
    <div style={{ position: 'relative', margin: '10vh auto' }}>
      
      {/* Travel Stickers placed around the card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0, rotate: -40 }}
        animate={{ opacity: 1, scale: 1, rotate: -15 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 15 }}
        whileHover={{ scale: 1.1, rotate: -5 }}
        style={getStickerStyle('-30px', 'auto', 'auto', '-40px')}
      >
        ✈️
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0, rotate: 40 }}
        animate={{ opacity: 1, scale: 1, rotate: 15 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 15 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        style={getStickerStyle('-20px', '-40px', 'auto', 'auto')}
      >
        🏝️
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: -10 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 15 }}
        whileHover={{ scale: 1.1, rotate: 0 }}
        style={getStickerStyle('auto', 'auto', '30px', '-50px')}
      >
        🎒
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0, rotate: 20 }}
        animate={{ opacity: 1, scale: 1, rotate: 10 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 15 }}
        whileHover={{ scale: 1.1, rotate: 0 }}
        style={getStickerStyle('auto', '-30px', '40px', 'auto')}
      >
        📸
      </motion.div>

      {/* Main Setup Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card"
        style={{ maxWidth: '600px', width: '100%', padding: '3rem 2rem', position: 'relative', zIndex: 10 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--primary-glow)', borderRadius: '24px', boxShadow: 'var(--shadow-glow)', marginBottom: '1.2rem', backdropFilter: 'blur(10px)' }}>
             <Wallet size={48} color="white" />
          </div>
          <h1 style={{ fontSize: '2.5rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            Welcome to SplitSmart
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Let's set up your trip layout and group context.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label">Title of your split</label>
            <input 
              className="input-field" 
              placeholder="e.g. Goa Trip 🏖️, Flatmates, Dinner"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              style={{ fontSize: '1.2rem', padding: '1rem', fontWeight: 'bold' }}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Who is involved?</label>
            <AnimatePresence>
              {members.map((member, index) => (
                <motion.div 
                  key={member.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}
                >
                  <input 
                    className="input-field" 
                    placeholder={`Person ${index + 1}`}
                    value={member.name}
                    onChange={e => handleNameChange(member.id, e.target.value)}
                    style={{ flex: 1 }}
                    required={index < 2} 
                  />
                  {members.length > 2 && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button" 
                      onClick={() => handleRemoveMember(member.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--negative-text)', cursor: 'pointer', padding: '0 0.5rem' }}
                    >
                      <X size={24} />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button" 
            onClick={handleAddMember}
            style={{ background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', justifyContent: 'center', fontWeight: 'bold', marginBottom: '3rem' }}
          >
            <Plus size={20} /> Add Another Person
          </motion.button>

          <motion.button 
            whileHover={isValid ? { scale: 1.05 } : {}}
            whileTap={isValid ? { scale: 0.95 } : {}}
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '3.5rem', fontSize: '1.15rem', opacity: isValid ? 1 : 0.5, cursor: isValid ? 'pointer' : 'not-allowed' }}
            disabled={!isValid}
          >
            Start Splitting <ArrowRight style={{ marginLeft: '0.5rem' }}/>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
