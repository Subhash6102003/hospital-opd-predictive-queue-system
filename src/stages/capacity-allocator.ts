import type { Stage, PipelineContext } from '../core/index.js';
import type { ScoredBooking, AllocatedSlot } from '../types.js';
import type { OpdQueueStore } from '../opd-store.js';

export function createCapacityAllocatorStage(store: OpdQueueStore): Stage<ScoredBooking, AllocatedSlot> {
  return {
    id: 'capacity-allocator',
    name: 'Dynamic OPD Capacity Allocator',
    description: 'Assigns booking into primary guaranteed slot or predictive standby queue',
    async run(input: ScoredBooking, ctx: PipelineContext): Promise<AllocatedSlot> {
      const slot = store.allocateSlot(
        input.bookingId,
        input.doctorId,
        input.slotTime,
        input.patient.patientId,
      );

      ctx.logger.info(`Assigned slot status: ${slot.status}`, {
        bookingId: slot.bookingId,
        patientId: slot.patientId,
        status: slot.status,
      });

      return slot;
    },
  };
}
