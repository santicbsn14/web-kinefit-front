

export type AppointmentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type CancelledBy = 'patient' | 'secretary' | 'professional'

export interface IAppointment {
  _id?: string
  patientId: string | IPatientRef
  professionalId: string | IProfessionalRef
  specialtyId: string | ISpecialtyRef
  date: Date | string
  timeFrom: string
  timeTo: string
  status: AppointmentStatus
  cancelledBy?: CancelledBy | null
  notes?: string
  secretaryNotes?: string
  createdAt?: Date
}

export interface IPatientRef {
  _id: string
  name: string
  email: string
    userId?: {
    _id: string
    name: string
    email: string
    phone?: string
  }
}

export interface IProfessionalRef {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
}

export interface ISpecialtyRef {
  _id: string
  name: string
  durationMinutes: number
  maxCapacity: number
  restriction: ISpecialtyRestriction
}

export interface ISpecialtyRestriction {
  hasRestriction: boolean
  days: string[]
  timeFrom: string
  timeTo: string
}

export interface CreateAppointmentDTO {
  professionalId: string
  specialtyId: string
  date: Date | string
  timeFrom: string
  notes?: string
}

export interface PaginatedResult<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
}

export interface TimeSlotDisplay {
  timeFrom: string
  timeTo: string
  available: boolean
}

export interface DayAvailability {
  day: string
  slots: TimeSlotDisplay[]
}