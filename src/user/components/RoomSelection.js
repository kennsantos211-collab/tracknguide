import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import '../styles/roomSelection.css';

function RoomSelection({ onSelectRoom, selectedRoom: selectedRoomProp, onBack }) {
  const [selectedRoom, setSelectedRoom] = useState(() => {
    // Try to restore from localStorage
    const saved = localStorage.getItem('selectedRoom');
    return saved ? JSON.parse(saved) : (selectedRoomProp || null);
  });
  const [imageError, setImageError] = useState("");
  // Always reset selectedRoom on mount to show room grid
  // Save selectedRoom to localStorage whenever it changes
  useEffect(() => {
    if (selectedRoom) {
      localStorage.setItem('selectedRoom', JSON.stringify(selectedRoom));
    } else {
      localStorage.removeItem('selectedRoom');
    }
  }, [selectedRoom]);

  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrError, setQrError] = useState('');
  const qrCodeScannerRef = useRef(null);
  const rooms = [
    { id: 'room_101', name: 'Room 101' },
    { id: 'room_102', name: 'Room 102' },
    { id: 'science_lab', name: 'Science Lab' },
    { id: 'room_103', name: 'Room 103' },
    { id: 'ssg_office', name: 'SSG Office' },
    { id: 'room_104', name: 'Room 104' },
    { id: 'room_105', name: 'Room 105' },
    { id: 'guidance_office', name: 'Guidance Office' },
    { id: 'clinic', name: 'Clinic' },
    { id: 'chancellor_office', name: "Chancellor's Office" },
    { id: 'finance', name: 'Finance Office' },
    { id: 'registrar', name: "Registrar's Office" },
    { id: 'hm_lab', name: 'HM Lab' },
    { id: 'hot_kitchen', name: 'Hot Kitchen' },
    { id: 'hs_room_102', name: 'HS Room 102' },
    { id: 'hs_room_103', name: 'HS Room 103' },
    { id: 'hs_room_104', name: 'HS Room 104' },
    { id: 'hs_room_105', name: 'HS Room 105' },
    { id: 'canteen', name: 'Canteen' },
    { id: 'chapel', name: 'Chapel' }
  ];

  // Helper to get image file name from room name
  const getImageFileName = (roomName) => {
    // Map room names to image file names as needed
    const map = {
      'Room 101': 'Room 101.png',
      'Room 102': 'Room 102.png',
      'Science Lab': 'Science Lab.png',
      'Room 103': 'Room 103.png',
      'SSG Office': 'SSG Office.png',
      'Room 104': 'Room 104.png',
      'Room 105': 'Room 105.png',
      'Guidance Office': 'Guidance Office.png',
      'Clinic': 'Clinic.png',
      "Chancellor's Office": "Chancellor's Office.png",
      'Finance Office': 'Finance Office.png',
      "Registrar's Office": "Registrar's Office.png",
      'HM Lab': 'HM Lab.png',
      'Hot Kitchen': 'Hot Kitchen.png',
      'HS Room 102': 'HS Room 102.png',
      'HS Room 103': 'HS Room 103.png',
      'HS Room 104': 'HS Room 104.png',
      'HS Room 105': 'HS Room 105.png',
      'Canteen': 'Canteen.png',
      'Chapel': 'Chapel.png',
    };
    return map[roomName] || null;
  };

  // QR Scanner effect (must be at top level)
  useEffect(() => {
    if (showQrScanner) {
      let html5QrCode = new Html5Qrcode('qr-reader');
      qrCodeScannerRef.current = html5QrCode;
      window.html5QrCodeScanner = html5QrCode;
      html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          alert('QR Code Scanned: ' + decodedText);
          setShowQrScanner(false);
          html5QrCode.stop().catch(()=>{});
        },
        (error) => {
          // Optionally handle scan errors
        }
      ).catch(err => {
        setQrError('Camera error: ' + err);
      });
      return () => {
        if (html5QrCode) html5QrCode.stop().catch(()=>{});
      };
    } else {
      // Cleanup if scanner is closed
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.stop().catch(()=>{});
        qrCodeScannerRef.current = null;
      }
    }
    // eslint-disable-next-line
  }, [showQrScanner]);

  return (
    <div className="room-selection-container">
      <div className="room-selection-box">
        {rooms.length === 0 && (
          <div style={{color: 'red', textAlign: 'center'}}>No rooms available.</div>
        )}
        {!selectedRoom && rooms.length > 0 ? (
          <>
            <h2 className="room-selection-title">Where would you like to go?</h2>
            <p className="room-selection-subtitle">Select a room to view directions</p>
            <div className="room-grid">
              {rooms.map(room => {
                // ...existing code for icon selection...
                let icon = (
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="8" width="16" height="10" rx="2" fill="#2980ff" />
                    <rect x="9" y="13" width="2" height="5" fill="#fff" />
                    <rect x="13" y="13" width="2" height="5" fill="#fff" />
                  </svg>
                );
                // ...existing code for icon overrides...
                if (room.name === 'Chapel') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="4" width="4" height="16" fill="#2980ff" />
                      <rect x="4" y="10" width="16" height="4" fill="#2980ff" />
                    </svg>
                  );
                } else if (room.name === 'Finance Office') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="7" width="18" height="10" rx="2" fill="#2980ff" />
                      <circle cx="12" cy="12" r="3" fill="#fff" />
                      <text x="12" y="14" textAnchor="middle" fontSize="6" fill="#2980ff" fontFamily="Arial">₱</text>
                    </svg>
                  );
                } else if (room.name === "Registrar's Office") {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="4" width="14" height="16" rx="2" fill="#2980ff" />
                      <rect x="7" y="8" width="10" height="2" fill="#fff" />
                      <rect x="7" y="12" width="7" height="2" fill="#fff" />
                    </svg>
                  );
                } else if (room.name === "Chancellor's Office") {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="10" r="4" fill="#2980ff" />
                      <rect x="7" y="16" width="10" height="4" rx="2" fill="#2980ff" />
                      <rect x="9" y="5" width="6" height="2" fill="#222" />
                    </svg>
                  );
                } else if (room.name === 'Canteen') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="7" y="4" width="2" height="12" rx="1" fill="#2980ff" />
                      <rect x="15" y="4" width="2" height="12" rx="1" fill="#2980ff" />
                      <circle cx="8" cy="18" r="2" fill="#2980ff" />
                      <circle cx="16" cy="18" r="2" fill="#2980ff" />
                    </svg>
                  );
                } else if (room.name === 'Hot Kitchen') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="14" width="12" height="4" rx="2" fill="#2980ff" />
                      <path d="M9 14V10M12 14V8M15 14V12" stroke="#2980ff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  );
                } else if (room.name === 'Clinic') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="6" width="4" height="12" fill="#2980ff" />
                      <rect x="6" y="10" width="12" height="4" fill="#2980ff" />
                    </svg>
                  );
                } else if (room.name === 'Guidance Office') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="12" cy="12" rx="8" ry="6" fill="#2980ff" />
                    </svg>
                  );
                } else if (room.name === 'Science Lab') {
                  icon = (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="4" width="4" height="8" fill="#2980ff" />
                      <path d="M8 12c0 4 8 4 8 0" stroke="#2980ff" strokeWidth="2" fill="none" />
                    </svg>
                  );
                }
                return (
                  <button
                    key={room.id}
                    className="room-card"
                    onClick={() => {
                      setSelectedRoom(room);
                      if (onSelectRoom) onSelectRoom(room);
                    }}
                  >
                    <span className="room-icon">{icon}</span>
                    <span className="room-name">{room.name}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
        {selectedRoom && (
          <div style={{textAlign: 'center', marginTop: '32px'}}>
            <h2 className="room-selection-title">{selectedRoom.name}</h2>
            <p className="room-selection-subtitle" style={{marginBottom: '18px'}}>Follow the red line to reach your destination.</p>
            {(() => { const imgPath = process.env.PUBLIC_URL + '/images/' + getImageFileName(selectedRoom.name); console.log('Image path for selected room:', imgPath); return null; })()}
            {getImageFileName(selectedRoom.name) ? (
              <>
                <img
                  src={process.env.PUBLIC_URL + '/images/' + getImageFileName(selectedRoom.name)}
                  alt={selectedRoom.name}
                  style={{width: '320px', height: '320px', objectFit: 'contain', margin: '16px auto'}}
                  onError={e => {
                    e.target.style.display = 'none';
                    const errorMsg = 'Failed to load image: ' + e.target.src;
                    console.error(errorMsg);
                    setImageError(errorMsg);
                  }}
                />
                {imageError && (
                  <div style={{color: 'red', margin: '8px auto'}}>{imageError}</div>
                )}
              </>
            ) : (
              <div style={{color: 'gray', margin: '16px auto'}}>No image available for this room.</div>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
              <button
                className="room-back-btn"
                style={{
                  background: '#2980ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  transition: 'background 0.2s',
                  marginTop: '0'
                }}
                onClick={() => {
                  setSelectedRoom(null);
                  setImageError("");
                  localStorage.removeItem('selectedRoom');
                  if (onBack) onBack();
                }}
                onMouseOver={e => e.currentTarget.style.background = '#1864ab'}
                onMouseOut={e => e.currentTarget.style.background = '#2980ff'}
              >
                Back to room selection
              </button>
              <button
                className="room-camera-btn"
                style={{
                  background: '#2980ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  transition: 'background 0.2s',
                  marginTop: '0'
                }}
                onClick={() => setShowQrScanner(true)}
                onMouseOver={e => e.currentTarget.style.background = '#1864ab'}
                onMouseOut={e => e.currentTarget.style.background = '#2980ff'}
              >
                Time Out
              </button>
            </div>
            {/* Removed duplicate Back to room selection button */}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomSelection;
