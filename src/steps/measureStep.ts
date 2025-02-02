import { M, S, WP } from '../constants';
import { reportPerf } from '../reportPerf';
import { config } from '../config';

import { STEP_THRESHOLDS, getRating } from '../vitalsScore';

export const measureStep = (
  step: string,
  startMark: string,
  endMark: string,
) => {
  const stepMetricName = S + step;
  const startMarkExists = WP.getEntriesByName(M + startMark).length > 0;
  const endMarkExists = WP.getEntriesByName(M + endMark).length > 0;
  if (!endMarkExists || !startMarkExists || !config.steps || !config.steps[step]) {
    return;
  }

  const { maxOutlierThreshold, vitalsThresholds } =
    STEP_THRESHOLDS[config.steps[step].threshold];

  const stepMeasure = WP.measure(stepMetricName, M + startMark, M + endMark);
  const { duration } = stepMeasure;
  if (duration <= maxOutlierThreshold) {
    const score = getRating(duration, vitalsThresholds);
    // Do not want to measure or log negative metrics
    if (duration >= 0) {
      reportPerf('userJourneyStep', duration, score, { stepName: step }, undefined);
      WP.measure(`step.${step}_vitals_${score}`, {
        start: stepMeasure.startTime + stepMeasure.duration,
        end: stepMeasure.startTime + stepMeasure.duration,
        detail: {
          type: 'stepVital',
          duration,
        },
      });
    }
  }
};
