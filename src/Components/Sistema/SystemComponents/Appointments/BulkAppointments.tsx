/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from 'react';
import { bulkAppointments } from '../../../../MockService/appointments';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import './bulkAppointments.css'
import { Professional } from '../../../../MockService/professionals';
import { Patient } from '../../../../MockService/patients';
import { CreateAppointment } from '../../../../Utils/Types/appointmentTypes';

interface AppointmentInput {
  pacient_id: string;
  professional_id: string;
  date: string;
  start_time: string;
  end_time: string;
  session_type: string;
}
interface BulkAppointmentsProps {
  patients: Patient[];
  professionals: Professional[];
  onClose: () => void;
  onSuccess: () => void;
}
const BulkAppointments : React.FC<BulkAppointmentsProps> = ({ patients, professionals, onClose, onSuccess }) => {
  const [appointments, setAppointments] = useState<AppointmentInput[]>([
    { pacient_id: '', professional_id: '', date: '', start_time: '', end_time: '', session_type: '' }
  ]);

  const handleInputChange = (index: number, field: keyof AppointmentInput, value: string) => {
    const newAppointments = [...appointments];
    newAppointments[index][field] = value;
    
    if (field === 'start_time') {
      // Automatically set end_time to one hour later
      const [hours, minutes] = value.split(':');
      const endTime = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
      endTime.setHours(endTime.getHours() + 1);
      newAppointments[index].end_time = endTime.toTimeString().slice(0,5);
    }
    
    setAppointments(newAppointments);
  };

  const addAppointmentField = () => {
    setAppointments([...appointments, { pacient_id: '', professional_id: '', date: '', start_time: '', end_time: '', session_type: '' }]);
  };

  const removeAppointmentField = (index: number) => {
    const newAppointments = appointments.filter((_, i) => i !== index);
    setAppointments(newAppointments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      //@ts-expect-error s
      const appointmentData: CreateAppointment[] = appointments.map(appointment => {
        const appointmentDate = dayjs(`${appointment.date}T${appointment.start_time}`);
        const weekDay = appointmentDate.day(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
        
        // Convert to 1-7 range where 1 is Monday and 7 is Sunday
        const adjustedWeekDay = weekDay === 0 ? 7 : weekDay;
        const end_time = appointmentDate.add(1,'hour')
        return {
          pacient_id: appointment.pacient_id,
          professional_id: appointment.professional_id,
          date_time: appointmentDate.toDate(),
          schedule: {
            week_day: adjustedWeekDay,
            time_slots: {
              start_time: appointmentDate.toDate(),
              end_time: end_time.toDate()
            }
          },
          session_type: appointment.session_type
        };
      });
      //@ts-expect-error s
      await bulkAppointments(appointmentData);
      toast.success('Los turnos han sido creados con éxito');
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bulkAppointmentsContainer">
      <h2 className="bulkAppointmentsTitle">Carga Masiva de Turnos</h2>
      <form onSubmit={handleSubmit} className="bulkAppointmentsForm">
        {appointments.map((appointment, index) => (
          <div key={index} className="appointmentField">
            <select
              value={appointment.pacient_id}
              onChange={(e) => handleInputChange(index, 'pacient_id', e.target.value)}
              required
            >
              <option value="">Seleccione un paciente</option>
              {patients.map((patient: Patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.user_id.firstname} {patient.user_id.lastname}
                </option>
              ))}
            </select>
            <select
              value={appointment.professional_id}
              onChange={(e) => handleInputChange(index, 'professional_id', e.target.value)}
              required
            >
              <option value="">Seleccione un profesional</option>
              {professionals.map((professional : Professional) => (
                <option key={professional._id} value={professional._id}>
                  {professional.user_id.firstname} {professional.user_id.lastname}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={appointment.date}
              onChange={(e) => handleInputChange(index, 'date', e.target.value)}
              required
            />
            <input
              type="time"
              value={appointment.start_time}
              onChange={(e) => handleInputChange(index, 'start_time', e.target.value)}
              required
            />
            <input
              type="time"
              value={appointment.end_time}
              onChange={(e) => handleInputChange(index, 'end_time', e.target.value)}
              required
              readOnly
            />
            <input
              type="text"
              placeholder="Tipo de sesión"
              value={appointment.session_type}
              onChange={(e) => handleInputChange(index, 'session_type', e.target.value)}
              required
            />
            <button type="button" onClick={() => removeAppointmentField(index)} className="removeButton">Eliminar</button>
          </div>
        ))}
        <div className="formActions">
          <button type="button" onClick={addAppointmentField} className="addButton">Agregar otro turno</button>
          <button type="submit" className="submitButton">Crear Turnos</button>
          <button type="button" onClick={onClose} className="cancelButton">Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default BulkAppointments;