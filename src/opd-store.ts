import type { AllocatedSlot, AppointmentStatus } from './types.js';

export class OpdQueueStore {
  private primarySlots = new Map<string, AllocatedSlot>(); // bookingId -> slot
  private standbyQueue: AllocatedSlot[] = [];

  constructor(public readonly maxPrimarySlots: number = 20) {}

  getPrimaryCount(): number {
    return this.primarySlots.size;
  }

  getStandbyCount(): number {
    return this.standbyQueue.length;
  }

  allocateSlot(bookingId: string, doctorId: string, slotTime: string, patientId: string): AllocatedSlot {
    if (this.primarySlots.size < this.maxPrimarySlots) {
      const slot: AllocatedSlot = {
        bookingId,
        doctorId,
        slotTime,
        patientId,
        status: 'BOOKED_PRIMARY',
        allocatedAt: Date.now(),
      };
      this.primarySlots.set(bookingId, slot);
      return slot;
    } else {
      const slot: AllocatedSlot = {
        bookingId,
        doctorId,
        slotTime,
        patientId,
        status: 'STANDBY_QUEUED',
        allocatedAt: Date.now(),
      };
      this.standbyQueue.push(slot);
      return slot;
    }
  }

  markNoShow(bookingId: string): { noShowSlot: AllocatedSlot; promotedStandby?: AllocatedSlot } {
    const primary = this.primarySlots.get(bookingId);
    if (!primary) throw new Error(`Primary slot ${bookingId} not found`);

    primary.status = 'NO_SHOW';
    this.primarySlots.delete(bookingId);

    let promoted: AllocatedSlot | undefined;
    if (this.standbyQueue.length > 0) {
      promoted = this.standbyQueue.shift()!;
      promoted.status = 'PROMOTED_FROM_STANDBY';
      this.primarySlots.set(promoted.bookingId, promoted);
    }

    return { noShowSlot: primary, promotedStandby: promoted };
  }

  checkIn(bookingId: string): AllocatedSlot {
    const primary = this.primarySlots.get(bookingId);
    if (!primary) throw new Error(`Active appointment ${bookingId} not found`);
    primary.status = 'CHECKED_IN';
    return { ...primary };
  }

  clear(): void {
    this.primarySlots.clear();
    this.standbyQueue = [];
  }
}
