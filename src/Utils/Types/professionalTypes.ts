export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface IWeeklySlot {
  day: DayOfWeek
  timeFrom: string
  timeTo: string
  isAvailable: boolean
}

export interface ISchedule {
  _id?: string
  professionalId: string
  weeklySlots: IWeeklySlot[]
}

export interface ISpecialty {
  _id: string
  name: string
  description?: string
  durationMinutes: number
  maxCapacity: number
  restriction: {
    hasRestriction: boolean
    days: DayOfWeek[]
    timeFrom: string
    timeTo: string
  }
}

export interface IProfessional {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  specialties: ISpecialty[]
  scheduleId?: ISchedule
}