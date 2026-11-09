import { Pipeline } from './core/index.js';
import type { BookingRequest, AllocatedSlot } from './types.js';
import { OpdQueueStore } from './opd-store.js';
import { predictiveScorerStage } from './stages/risk-scorer.js';
import { createCapacityAllocatorStage } from './stages/capacity-allocator.js';
import type { Stage, PipelineResult } from './core/index.js';

export function createOpdPipeline(store: OpdQueueStore) {
  const pipeline = new Pipeline<BookingRequest, AllocatedSlot>('opd-scheduling');

  const stages: Stage<unknown, unknown>[] = [
    predictiveScorerStage as Stage<unknown, unknown>,
    createCapacityAllocatorStage(store) as Stage<unknown, unknown>,
  ];

  return {
    async processBooking(request: BookingRequest): Promise<PipelineResult<AllocatedSlot>> {
      return pipeline.run(stages, request);
    },
    store,
  };
}
