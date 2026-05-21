export interface Gender {
  id: number
  name: string
}

export interface Service {
  id: number
  name: string
  description?: string | null
  price?: number | null
  is_active: boolean
}

export interface AppUser {
  id: number
  username?: string
  role: string
  first_name: string
  last_name: string
  middle_name?: string | null
  full_name: string
  initials: string
  title?: string | null
  suffix?: string | null
  photo?: string | null
  photo_url?: string | null
  email?: string | null
  phone?: string | null
  birth_date?: string | null
  age?: number | null
  gender_id?: number | null
  gender?: string | null
}

export interface Appointment {
  id: number
  patient_id: number
  patient_name?: string
  service_id?: number | null
  service_name?: string | null
  doctor_id?: number | null
  doctor_name?: string | null
  appointment_date: string
  appointment_time: string
  status: string
  source?: string
  notes?: string | null
}

export interface CustomerAppointment {
  id: number
  service_id?: number | null
  service_name?: string | null
  doctor_name?: string | null
  appointment_date: string
  appointment_time: string
  status: string
  notes?: string | null
  source?: string
}

export interface ReportRow {
  [key: string]: string | number
}

export interface ReportData {
  title: string
  from?: string
  to?: string
  generated_at: string
  summary: Record<string, number>
  rows: ReportRow[]
}
