import { Dayjs } from "dayjs";

export interface TimeSlot {
    start_time: Dayjs;
    end_time: Dayjs;
}

export interface DaySchedule {
    week_day: number; 
    time_slots: TimeSlot;
}

export interface CreateAppointmentDto {
    pacient: string;          
    professional: string;     
    date_time: Date;
    schedule: DaySchedule;             
    state: string;               
    session_type: string;        
}
export interface Criteria {
    limit?: number;
    page?: number;
}