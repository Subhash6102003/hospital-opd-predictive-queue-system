import { describe, it, expect, beforeEach } from 'vitest';
import { OpdQueueStore } from '../src/opd-store.js';
import { createOpdPipeline } from '../src/pipeline.js';
import type { BookingRequest } from '../src/types.js';

describe('S1 — Hospital OPD Predictive Queue Pipeline', () => {
  let store: OpdQueueStore;
  let pipeline: ReturnType<typeof createOpdPipeline>;

  beforeEach(() => {
    store = new OpdQueueStore(3); // Capacity = 3 slots for testing
    pipeline = createOpdPipeline(store);
  });

  const makeBooking = (id: string, noShowRate: number = 0.1): BookingRequest => ({
    bookingId: `book-${id}`,
    doctorId: 'doc-cardio-1',
    slotTime: '10:00',
    patient: {
      patientId: `pat-${id}`,
      name: `Patient ${id}`,
      pastAppointments: 10,
      pastNoShows: Math.round(10 * noShowRate),
      distanceKm: 5,
      isEmergency: false,
    },
  });

  it('allocates primary guaranteed slot when capacity is available', async () => {
    const res = await pipeline.processBooking(makeBooking('1'));
    expect(res.status).toBe('success');
    expect(res.output?.status).toBe('BOOKED_PRIMARY');
    expect(store.getPrimaryCount()).toBe(1);
    expect(store.getStandbyCount()).toBe(0);
  });

  it('queues bookings as STANDBY when primary capacity is reached', async () => {
    await pipeline.processBooking(makeBooking('1'));
    await pipeline.processBooking(makeBooking('2'));
    await pipeline.processBooking(makeBooking('3'));

    // 4th booking exceeds maxPrimarySlots = 3
    const res4 = await pipeline.processBooking(makeBooking('4'));
    expect(res4.status).toBe('success');
    expect(res4.output?.status).toBe('STANDBY_QUEUED');

    expect(store.getPrimaryCount()).toBe(3);
    expect(store.getStandbyCount()).toBe(1);
  });

  it('automatically promotes standby patient when a primary patient is marked NO_SHOW', async () => {
    await pipeline.processBooking(makeBooking('1'));
    await pipeline.processBooking(makeBooking('2'));
    await pipeline.processBooking(makeBooking('3'));
    await pipeline.processBooking(makeBooking('4')); // Standby

    // Patient 2 fails to check in (no show)
    const { noShowSlot, promotedStandby } = store.markNoShow('book-2');

    expect(noShowSlot.status).toBe('NO_SHOW');
    expect(promotedStandby).toBeDefined();
    expect(promotedStandby?.bookingId).toBe('book-4');
    expect(promotedStandby?.status).toBe('PROMOTED_FROM_STANDBY');

    // Standby queue should now be empty and primary capacity preserved at 3
    expect(store.getStandbyCount()).toBe(0);
    expect(store.getPrimaryCount()).toBe(3);
  });

  it('allows checked in patients to complete consultation without disruption', async () => {
    await pipeline.processBooking(makeBooking('1'));
    const checkedIn = store.checkIn('book-1');
    expect(checkedIn.status).toBe('CHECKED_IN');
  });
});
