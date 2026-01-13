import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../styles/registrationForm.css';

function VisitorForm({ onComplete }) {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [office, setOffice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const userId = `visitor_${Date.now()}`;
      const userData = {
        id: userId,
        name: name.trim(),
        purpose: purpose.trim(),
        office: office.trim(),
        type: 'visitor',
        registeredAt: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', userId), userData);

      // Save to localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(userData));

      onComplete(userData);
    } catch (error) {
      console.error('Error saving visitor data:', error);
      alert('Failed to register. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-box">
        <h2 className="registration-title">Visitor Registration</h2>
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="purpose" className="form-label">Purpose of Visit</label>
            <input
              id="purpose"
              type="text"
              className="form-input"
              placeholder="Enter purpose of visit"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="office" className="form-label">Office</label>
            <select
              id="office"
              className="form-input"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              disabled={loading}
            >
              <option value="">Select office</option>
              <option value="Chancellor's Office">Chancellor's Office</option>
              <option value="Finance Office">Finance Office</option>
              <option value="Guidance Office">Guidance Office</option>
              <option value="Registrar Office">Registrar Office</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="form-btn"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VisitorForm;
