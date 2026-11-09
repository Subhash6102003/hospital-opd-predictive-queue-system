export type AppointmentStatus =
  | 'BOOKED_PRIMARY'
  | 'STANDBY_QUEUED'
  | 'CHECKED_IN'
  | 'PROMOTED_FROM_STANDBY'
  | 'NO_SHOW'
  | 'COMPLETED'
  | 'CANCELLED';

export interface PatientProfile {
  patientId: string;
  name: string;
  pastAppointments: number;
  pastNoShows: number;
  distanceKm: number;
  isEmergency: boolean;
}

export interface BookingRequest {
  bookingId: string;
  doctorId: string;
  slotTime: string; // e.g. "10:00"
  patient: PatientProfile;
}

export interface ScoredBooking {
  bookingId: string;
  doctorId: string;
  slotTime: string;
  patient: PatientProfile;
  noShowProbability: number; // 0.0 - 1.0
  urgencyScore: number;
}

export interface AllocatedSlot {
  bookingId: string;
  doctorId: string;
  slotTime: string;
  patientId: string;
  status: AppointmentStatus;
  allocatedAt: number;
}

export interface OpdSessionSummary {
  doctorId: string;
  totalSlots: number;
  primaryBookings: number;
  standbyBookings: number;
  expectedNoShows: number;
  effectiveCapacityUtilization: number;
}
