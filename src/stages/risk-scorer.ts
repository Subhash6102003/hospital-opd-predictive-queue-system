import type { Stage, PipelineContext } from '../core/index.js';
import type { BookingRequest, ScoredBooking } from '../types.js';

export const predictiveScorerStage: Stage<BookingRequest, ScoredBooking> = {
  id: 'predictive-no-show-scorer',
  name: 'Predictive No-Show Scoring',
  description: 'Calculates no-show probability using historical attendance and transit distance',
  async run(input: BookingRequest, ctx: PipelineContext): Promise<ScoredBooking> {
    const { pastAppointments, pastNoShows, distanceKm, isEmergency } = input.patient;

    // Base prior in public hospitals: 0.35 (35%)
    let p = 0.35;

    // Historical behavior weighting
    if (pastAppointments > 0) {
      const historicalRate = pastNoShows / pastAppointments;
      p = p * 0.3 + historicalRate * 0.7;
    }

    // Distance penalty: patients living > 25km away have higher cancellation probability
    if (distanceKm > 25) {
      p += 0.15;
    }

    // Emergency factor reduces no-show likelihood
    if (isEmergency) {
      p = Math.min(p, 0.05);
    }

    // Clamp probability between 0.01 and 0.95
    p = Math.max(0.01, Math.min(0.95, Number(p.toFixed(2))));

    const urgencyScore = isEmergency ? 100 : Math.round((1 - p) * 100);

    ctx.logger.info(`Calculated patient risk score`, {
      patientId: input.patient.patientId,
      noShowProbability: p,
      urgencyScore,
    });

    return {
      ...input,
      noShowProbability: p,
      urgencyScore,
    };
  },
};
