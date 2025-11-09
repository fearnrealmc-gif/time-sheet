

export enum Role {
  HR = 'HR',
  Foreman = 'Foreman',
  Engineer = 'Engineer',
  Accountant = 'Accountant',
}

// Fix: Added Language type to be used across the application.
export type Language = 'en' | 'ar';

export enum WorkerStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum AttendanceStatus {
  Present = 'P',
  Absent = 'A',
  AnnualLeave = 'AL',
  SickLeave = 'SL',
  EmergencyLeave = 'EL',
  UnpaidLeave = 'UL',
  PublicHoliday = 'PH',
  Weekend = 'W',
}

export enum ReviewStatus {
  Pending = 'pending',
  Submitted = 'submitted',
  Approved = 'approved',
  Returned = 'returned',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  company_id: string;
  // Fix: Added optional language property to User type to resolve type error in App.tsx.
  language?: Language;
}

export interface Company {
  id: string;
  name: string;
  logo_url: string;
  headcount: number;
}

export interface Site {
  id: string;
  name: string;
  company_id: string;
  is_active: boolean;
}

export interface Worker {
  id: string;
  full_name: string;
  worker_code: string;
  start_date: string;
  status: WorkerStatus;
  company_id: string;
  site_id?: string;
  foreman_id?: string;
}

export interface AttendanceEntry {
  id: string;
  worker_id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus | '';
  site_id?: string;
  notes?: string;
  overtime_hours?: number;
}

export interface AttendanceCycle {
  id: string;
  company_id: string;
  month_label: string;
  start_date: Date;
  end_date: Date;
}

export interface EngineerReview {
  id: string;
  cycle_id: string;
  engineer_id: string;
  signed_at?: string;
  status: ReviewStatus;
  hr_notes?: string;
  signature_blob_url?: string;
}