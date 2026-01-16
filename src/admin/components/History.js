import React, { useEffect, useState } from 'react';
import '../styles/history.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function History({ visits = [] }) {
  const [history, setHistory] = useState([]);
  // Only use one selected day state for calendar
  const [selectedDay, setSelectedDay] = useState(null);
  const now = new Date();
  const [monthIndex, setMonthIndex] = useState(now.getMonth()); // 0-11, show current month by default
  const [year, setYear] = useState(now.getFullYear());
  const [selectedRole, setSelectedRole] = useState('All');

  useEffect(() => {
    // Use all visits for the calendar view
    if (visits && visits.length > 0) {
      setHistory(visits);
      return;
    }

    setHistory([]);
  }, [visits]);

  // helpers
  const pad = (n) => String(n).padStart(2, '0');
  const monthNumber = monthIndex + 1; // 1-12
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const monthName = new Date(year, monthIndex, 1).toLocaleString(undefined, { month: 'long' }).toUpperCase();

  // attempt to extract ISO date (YYYY-MM-DD) from a visit object
  const extractISODate = (v) => {
    if (!v) return null;
    
    // First check if date field exists and convert to ISO format
    if (v.date && typeof v.date === 'string') {
      // If it's already in ISO format (YYYY-MM-DD)
      if (/\d{4}-\d{2}-\d{2}/.test(v.date)) {
        return v.date.split('T')[0];
      }
      // If it's in local format like "12/12/2025", convert it
      try {
        const dateObj = new Date(v.date);
        if (!isNaN(dateObj.getTime())) {
          const y = dateObj.getFullYear();
          const m = pad(dateObj.getMonth() + 1);
          const d = pad(dateObj.getDate());
          return `${y}-${m}-${d}`;
        }
      } catch (e) {
        // ignore
      }
    }
    
    if (v.createdAt && typeof v.createdAt === 'string' && /\d{4}-\d{2}-\d{2}/.test(v.createdAt)) {
      return v.createdAt.split('T')[0];
    }
    
    // search any string field for ISO date
    for (const val of Object.values(v)) {
      if (typeof val === 'string') {
        const m = val.match(/(\d{4}-\d{2}-\d{2})/);
        if (m) return m[1];
      }
      if (val instanceof Date) return val.toISOString().split('T')[0];
    }
    return null;
  };

  // derive available years from history/visits (fallback to a small range)
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  // apply role filter to history for counting and display
  const filteredHistory = history.filter(h => {
    if (!selectedRole || selectedRole === 'All') return true;
    const t = (h.type || '').toString().toLowerCase();
    return t === selectedRole.toString().toLowerCase();
  });

  // Calculate second month
  const nextMonthIndex = (monthIndex + 1) % 12;
  const nextYear = monthIndex === 11 ? year + 1 : year;
  const nextMonthNumber = nextMonthIndex + 1;
  const daysInNextMonth = new Date(nextYear, nextMonthNumber, 0).getDate();
  const nextMonthName = new Date(nextYear, nextMonthIndex, 1).toLocaleString(undefined, { month: 'long' }).toUpperCase();

  // build map of counts per day for both months (from filtered history)
  const countsByDay = {};
  const countsByDayNextMonth = {};
  const calendarData = {};
  filteredHistory.forEach(entry => {
    const iso = extractISODate(entry);
    if (!iso) return;
    const [y, m, d] = iso.split('-');
    
    // First month
    if (Number(y) === year && Number(m) === monthNumber) {
      const day = Number(d);
      countsByDay[day] = (countsByDay[day] || 0) + 1;
      if (!calendarData[iso]) calendarData[iso] = [];
      calendarData[iso].push(entry);
    }
    
    // Second month
    if (Number(y) === nextYear && Number(m) === nextMonthNumber) {
      const day = Number(d);
      countsByDayNextMonth[day] = (countsByDayNextMonth[day] || 0) + 1;
      if (!calendarData[iso]) calendarData[iso] = [];
      calendarData[iso].push(entry);
    }
  });

  const handleDayClick = (day, isNextMonth = false) => {
    const targetYear = isNextMonth ? nextYear : year;
    const targetMonth = isNextMonth ? nextMonthNumber : monthNumber;
    const iso = `${targetYear}-${pad(targetMonth)}-${pad(day)}`;
    setSelectedDay(prev => (prev === iso ? null : iso));
  };

  const handleMonthChange = (e) => {
    const mi = Number(e.target.value);
    setMonthIndex(mi);
    setSelectedDay(null);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setSelectedDay(null);
  };

  const handleYearChange = (e) => {
    const y = Number(e.target.value);
    setYear(y);
    setSelectedDay(null);
  };

  const handleDownloadDailyReport = () => {
    if (!selectedDay) {
      alert('Please select a day first to download the daily report.');
      return;
    }

    const entries = calendarData[selectedDay] || [];
    if (entries.length === 0) {
      alert('No entries available for the selected day.');
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Daily Report - ${selectedDay}`, 14, 20);
    
    // Add filter info
    doc.setFontSize(10);
    doc.text(`Role Filter: ${selectedRole}`, 14, 30);
    doc.text(`Total Entries: ${entries.length}`, 14, 36);
    
    // Prepare table data
    const tableColumn = selectedRole === 'Visitor' 
      ? ['Name', 'Type', 'Time In', 'Time Out', 'Purpose', 'Room']
      : ['Name', 'Type', 'Time In', 'Time Out', 'Room'];
    
    const tableRows = entries.map(v => {
      const row = [
        v.name || v.text || '—',
        v.type || '—',
        v.timeInFormatted || v.timeIn || v.time || '—',
        v.timeOutFormatted || v.timeOut || '—'
      ];
      
      if (selectedRole === 'Visitor') {
        row.push(v.purpose || '—');
      }
      
      row.push(v.room || '—');
      return row;
    });

    // Add table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 }
    });
    
    // Save the PDF
    doc.save(`daily-report-${selectedDay}.pdf`);
  };

  const selectedEntries = selectedDay ? calendarData[selectedDay] || [] : [];

  return (
    <section className="history-echo">
      <div className="history-echo__controls">
        <label className="history-echo__label">Month:
          <select className="history-echo__select" value={monthIndex} onChange={handleMonthChange}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{new Date(0, i).toLocaleString(undefined, { month: 'long' })}</option>
            ))}
          </select>
        </label>
        <label className="history-echo__label">Year:
          <select className="history-echo__select" value={year} onChange={handleYearChange}>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <label className="history-echo__label">Role:
          <select className="history-echo__select" value={selectedRole} onChange={handleRoleChange}>
            <option value="All">All</option>
            <option value="Newcomer">Newcomers</option>
            <option value="Visitor">Visitors</option>
          </select>
        </label>
      </div>
      
      <div className="history-echo__split">
        {/* Left side - Calendar */}
        <div className="history-echo__calendar-section">
          {/* First Month */}
          <h2 className="history-echo__title">{monthName} {year}</h2>
          {/* Calendar header row: Sunday to Saturday */}
          <div className="history-echo__calendar-header">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(dayName => (
              <div key={dayName} className="history-echo__calendar-header-cell">{dayName}</div>
            ))}
          </div>
          <div className="history-echo__calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: new Date(year, monthIndex, 1).getDay() }, (_, i) => (
              <div key={`empty-${i}`} className="history-echo__calendar-cell empty"></div>
            ))}
            {/* Calendar dates aligned to days */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <div key={day} className="history-echo__calendar-cell">
                <button
                    className={`history-echo__date-btn ${selectedDay === `${year}-${pad(monthNumber)}-${pad(day)}` ? 'is-open' : ''}`}
                    style={{ fontFamily: 'Poppins, Arial, Helvetica, sans-serif' }}
                  onClick={() => handleDayClick(day, false)}
                >
                  <span>{day}</span>
                  {countsByDay[day] ? (
                    <span className="history-echo__date-count">{countsByDay[day]}</span>
                  ) : null}
                </button>
              </div>
            ))}
          </div>

          {/* Second Month */}
          <h2 className="history-echo__title" style={{ marginTop: '32px' }}>{nextMonthName} {nextYear}</h2>
          <div className="history-echo__calendar-header">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(dayName => (
              <div key={`next-${dayName}`} className="history-echo__calendar-header-cell">{dayName}</div>
            ))}
          </div>
          <div className="history-echo__calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Empty cells for days before the first of the next month */}
            {Array.from({ length: new Date(nextYear, nextMonthIndex, 1).getDay() }, (_, i) => (
              <div key={`next-empty-${i}`} className="history-echo__calendar-cell empty"></div>
            ))}
            {/* Calendar dates aligned to days */}
            {Array.from({ length: daysInNextMonth }, (_, i) => i + 1).map(day => (
              <div key={`next-${day}`} className="history-echo__calendar-cell">
                <button
                    className={`history-echo__date-btn ${selectedDay === `${nextYear}-${pad(nextMonthNumber)}-${pad(day)}` ? 'is-open' : ''}`}
                    style={{ fontFamily: 'Poppins, Arial, Helvetica, sans-serif' }}
                  onClick={() => handleDayClick(day, true)}
                >
                  <span>{day}</span>
                  {countsByDayNextMonth[day] ? (
                    <span className="history-echo__date-count">{countsByDayNextMonth[day]}</span>
                  ) : null}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right side - Data Table */}
        <div className="history-echo__data-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="history-echo__title" style={{ margin: 0 }}>{selectedDay ? `Entries for ${selectedDay}` : 'Select a day'}</h2>
            {selectedDay && selectedEntries.length > 0 && (
              <button 
                className="history-echo__download-btn" 
                onClick={handleDownloadDailyReport}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2980b9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, Arial, Helvetica, sans-serif',
                  fontSize: '14px'
                }}
              >
                Download Daily Report
              </button>
            )}
          </div>
          {selectedDay ? (
            <div className="history-echo__day-entries">
              {selectedEntries.length === 0 ? (
                <p className="history-echo__empty">No entries for this day.</p>
              ) : (
                <div className="home__logwrap">
                  <table className="home__table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Time In</th>
                        <th>Time Out</th>
                        {selectedRole === 'Visitor' && <th>Purpose</th>}
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEntries.map((v, i) => (
                        <tr key={v.id || i} className="home__row">
                          <td>{v.name || v.text || '—'}</td>
                          <td>{v.type || '—'}</td>
                          <td>{v.timeInFormatted || v.timeIn || v.time || '—'}</td>
                          <td>{v.timeOutFormatted || v.timeOut || '—'}</td>
                          {selectedRole === 'Visitor' && <td>{v.purpose || '—'}</td>}
                          <td>{v.room || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p className="history-echo__empty">Click on a date in the calendar to view entries.</p>
          )}
        </div>
      </div>
    </section>
  );
}
