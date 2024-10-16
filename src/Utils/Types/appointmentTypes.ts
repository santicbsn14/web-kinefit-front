import { Dayjs } from "dayjs";
import { Professional } from "../../MockService/professionals";
import { Patient } from "../../MockService/patients";

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
    date_time: Date | null;
    schedule: DaySchedule;             
    state: string;               
    session_type: string;        
}
export interface Criteria {
    limit?: number;
    page?: number;
}
export interface CreateAppointment {
    _id?: string;
    pacient_id: Patient | string;          
    professional_id: Professional | string;     
    date_time: Date | null;
    schedule: DaySchedule;             
    state?: string;               
    session_type: string;    
    order_photo?: string;    
}