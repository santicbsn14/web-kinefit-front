/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import './bulkAppointments.css';
import { Professional } from '../../../../MockService/professionals';
import { Patient } from '../../../../MockService/patients';
import { bulkAppointments } from '../../../../MockService/appointments';
import { CreateAppointmentDto } from '../../../../Utils/Types/appointmentTypes';

interface AppointmentInput {
  date: string;
  start_time: string;
}

interface BulkAppointmentsProps {
  patients: Patient[];
  professionals: Professional[];
  onClose: () => void;
  onSuccess: () => void;
}

const BulkAppointments: React.FC<BulkAppointmentsProps> = ({
  patients,
  professionals,
  onClose,
  onSuccess,
}) => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [appointments, setAppointments] = useState<AppointmentInput[]>([
    { date: '', start_time: '' },
  ]);

  const handleInputChange = (
    index: number,
    field: keyof AppointmentInput,
    value: string
  ) => {
    const newAppointments = [...appointments];
    newAppointments[index][field] = value;
    setAppointments(newAppointments);
  };

  const addAppointmentField = () => {
    setAppointments([...appointments, { date: '', start_time: '' }]);
  };

  const removeAppointmentField = (index: number) => {
    const newAppointments = appointments.filter((_, i) => i !== index);
    setAppointments(newAppointments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !selectedProfessional || !sessionType) {
      toast.error('Por favor, complete todos los campos antes de enviar.');
      return;
    }

    if (appointments.some((appointment) => !appointment.date || !appointment.start_time)) {
      toast.error('Asegúrese de completar todas las fechas y horas de inicio.');
      return;
    }

    try {
      const appointmentData = appointments.map((appointment) => {
        const startDateTime = dayjs(`${appointment.date}T${appointment.start_time}`);
        const endDateTime = startDateTime.add(45, 'minute');
        const weekDay = startDateTime.day() === 0 ? 7 : startDateTime.day();

        return {
          pacient_id: selectedPatient,
          professional_id: selectedProfessional,
          date_time: startDateTime.toDate(),
          schedule: {
            week_day: weekDay,
            time_slots: {
              start_time: startDateTime.toDate(),
              end_time: endDateTime.toDate(),
            },
          },
          session_type: sessionType,
        };
      });
      
      await bulkAppointments(appointmentData as unknown as CreateAppointmentDto[])

      // Simular llamada al servicio
      toast.success('Turnos creados con éxito');
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Error al crear los turnos: ${errorMessage}`);
    }
  };

  return (
    <div className="bulkAppointmentsContainer">
      <h2 className="bulkAppointmentsTitle">Carga Masiva de Turnos</h2>
      <form onSubmit={handleSubmit} className="bulkAppointmentsForm">
        <div className="formGroup">
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            required
          >
            <option value="">Seleccione un paciente</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.user_id.firstname} {patient.user_id.lastname}
              </option>
            ))}
          </select>
        </div>
        <div className="formGroup">
          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            required
          >
            <option value="">Seleccione un profesional</option>
            {professionals.map((professional) => (
              <option key={professional._id} value={professional._id}>
                {professional.user_id.firstname} {professional.user_id.lastname}
              </option>
            ))}
          </select>
        </div>
        <div className="formGroup">
          <input
            type="text"
            placeholder="Tipo de sesión"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            required
          />
        </div>
        {appointments.map((appointment, index) => (
          <div key={index} className="appointmentField">
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
            {appointments.length > 1 && (
              <button
                type="button"
                onClick={() => removeAppointmentField(index)}
                className="removeButton"
              >
                Eliminar
              </button>
            )}
          </div>
        ))}
        <div className="formActions">
          <button
            type="button"
            onClick={addAppointmentField}
            className="addButton"
          >
            Agregar turno
          </button>
          <button type="submit" className="submitButton">
            Crear Turnos
          </button>
          <button type="button" onClick={onClose} className="cancelButton">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkAppointments;
