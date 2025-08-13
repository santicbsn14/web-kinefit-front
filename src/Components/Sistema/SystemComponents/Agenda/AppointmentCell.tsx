import { useState } from 'react';

// @ts-expect-error simplificado
const AppointmentCell = ({ appointment }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!appointment || !appointment.pacient_id || !appointment.professional_id) {
    return <div className="turnoLabel">Cargando…</div>;
  }

  const patient = `${appointment.pacient_id.user_id.firstname} ${appointment.pacient_id.user_id.lastname}`;
  const pro = `${appointment.professional_id.user_id.firstname} ${appointment.professional_id.user_id.lastname}`;
  const detail = `${appointment.session_type} (${appointment.state})`;

  return (
    <div
      className="turnoLabel"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {patient}
      {showTooltip && (
        <div className="turnoTooltip">
          {pro}: {detail}
        </div>
      )}
    </div>
  );
};

export default AppointmentCell;
