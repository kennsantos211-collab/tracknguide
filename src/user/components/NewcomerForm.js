import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../styles/registrationForm.css';

function NewcomerForm({ onComplete }) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [office, setOffice] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  useEffect(() => {
    // Check if user is already registered as a newcomer
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.type === 'newcomer') {
          setAlreadyRegistered(true);
          setName(parsed.name);
          setDepartment(parsed.department || '');
          setYearLevel(parsed.yearLevel || '');
          setOffice(parsed.office || '');
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Clear year level when department changes
  useEffect(() => {
    setYearLevel('');
  }, [department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !department.trim() || !yearLevel.trim() || !office.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const userId = `newcomer_${Date.now()}`;
      const userData = {
        id: userId,
        name: name.trim(),
        department: department.trim(),
        yearLevel: yearLevel.trim(),
        office: office.trim(),
        type: 'newcomer',
        registeredAt: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', userId), userData);

      // Save to localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(userData));

      onComplete(userData);
    } catch (error) {
      console.error('Error saving newcomer data:', error);
      alert('Failed to register. Please try again.');
      setLoading(false);
    }
  };

  if (alreadyRegistered) {
    return (
      <div className="registration-container">
        <div className="registration-box">
          <p className="registration-message">You are already registered as a newcomer. Please proceed to the next step or logout to register a new user.</p>
          <button className="form-btn" onClick={() => onComplete(JSON.parse(localStorage.getItem('userData')))}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container">
      <div className="registration-box">
        <h2 className="registration-title">Newcomer Registration</h2>
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
            <label htmlFor="department" className="form-label">Department</label>
            <select
              id="department"
              className="form-input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select department</option>
              <option value="College">College</option>
              <option value="High School">High School</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="yearLevel" className="form-label">Year Level</label>
            <select
              id="yearLevel"
              className="form-input"
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              disabled={loading || !department}
              required
            >
              <option value="">Select year level</option>
              {department === 'High School' && (
                <>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </>
              )}
              {department === 'College' && (
                <>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="office" className="form-label">Office</label>
            <select
              id="office"
              className="form-input"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select office</option>
              <option value="Chancellor's Office">Chancellor's Office</option>
              <option value="Finance Office">Finance Office</option>
              <option value="Guidance Office">Guidance Office</option>
              <option value="Registrar Office">Registrar Office</option>
              <option value="BED Library">BED Library</option>
              <option value="College Library">College Library</option>
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

export default NewcomerForm;
