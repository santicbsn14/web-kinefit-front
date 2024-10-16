import React, { useState } from 'react';

const AppointmentCell = ({ appointment }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="turnoLabel"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ position: 'relative' }}
    >
      {`${appointment.pacient_id.user_id.firstname} ${appointment.pacient_id.user_id.lastname}`}
      {showTooltip && (
        <div 
          style={{
            position: 'absolute',
            top: '-40px',
            left: '0',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '5px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 1000,
            whiteSpace: 'nowrap'
          }}
        >
          {`${appointment.professional_id.user_id.firstname} ${appointment.professional_id.user_id.lastname}:${appointment.session_type} (${appointment.state})`}
        </div>
      )}
    </div>
  );
};

export default AppointmentCell;