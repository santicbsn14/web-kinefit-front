export interface TimeSlot {
    start_time: string;
    end_time: string;
}

export interface DaySchedule {
    week_day: number; 
    time_slots: TimeSlot;
}

export interface ProfessionalTimeSlots {
    _id?: string;
    professional_id:string;
    schedule: DaySchedule[];
    state: 'Disponible' | 'No disponible' | 'Vacaciones' | 'Feriado' | 'Licencia';
    date_range?: {
        start_date: Date;
        end_date: Date;
    };
}
export interface DayScheduleBBDD {
    week_day: number; 
    time_slots: {
        start_time: Date;
        end_time: Date;
    }
}
export interface ProfessionalTimeSlotsBBDD {
    _id?: string;
    professional_id:string;
    schedule: DayScheduleBBDD[];
    state: 'Disponible' | 'No disponible' | 'Vacaciones' | 'Feriado' | 'Licencia';
    date_range?: {
        start_date: Date;
        end_date: Date;
    };
}