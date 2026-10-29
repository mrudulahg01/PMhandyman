import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNEYS, SEGMENTS, PERIODS, getJourneyData } from '../data.js';

const countFields = ['entered', 'completed', 'dropped', 'repeatUsers', 'errorUsers', 'supportCount'];
const rateFields = ['dropRate', 'repeatRate', 'errorRate'];
const sum = (items, field) => items.reduce((total, item) => total + item[field], 0);

function assertCount(value, description) {
  assert.ok(Number.isInteger(value) && value >= 0, `${description} must be a nonnegative integer`);
}

function assertPercent(value, description) {
  assert.ok(Number.isFinite(value) && value >= 0 && value <= 100, `${description} must be between 0% and 100%`);
}

function assertRate(value, numerator, denominator, description) {
  assertPercent(value, description);
  const exact = denominator ? numerator / denominator * 100 : 0;
  assert.ok(Math.abs(value - exact) <= 0.050001, `${description} must describe the underlying customer count`);
}

for (const journey of JOURNEYS) {
  for (const segment of ['all', ...SEGMENTS]) {
    for (const { value: period } of PERIODS) {
      test(`${journey.name} / ${segment} / ${period} days: cohorts, friction, and evidence stay consistent`, () => {
        const data = getJourneyData(journey.id, segment, period);
        assert.ok(data.steps.length > 0, 'a journey must contain milestones');
        assert.equal(data.entered, data.steps[0].entered, 'the cohort starts at the first milestone');
        assert.equal(data.completed, data.steps.at(-1).completed, 'only the terminal outcome completes the journey');
        assert.equal(data.abandoned, data.entered - data.completed, 'abandonment must reconcile with completions');
        assert.equal(data.abandoned, sum(data.steps, 'dropped'), 'each abandoned customer leaves at exactly one milestone');
        assert.equal(data.supportCount, sum(data.steps, 'supportCount'), 'support conversations reconcile across milestones');
        assertRate(data.completionRate, data.completed, data.entered, 'journey completion rate');
        assertRate(data.abandonmentRate, data.abandoned, data.entered, 'journey abandonment rate');

        for (const field of ['repeatUsers', 'errorUsers']) {
          assertCount(data[field], `journey ${field}`);
          assert.ok(data[field] <= data.entered, `${field} cannot exceed the original cohort`);
          assert.ok(data[field] >= Math.max(...data.steps.map(step => step[field])), `deduplicated ${field} cannot be below a single milestone`);
          assert.ok(data[field] <= sum(data.steps, field), `deduplicated ${field} cannot exceed all milestone occurrences`);
        }
        assertRate(data.repeatRate, data.repeatUsers, data.entered, 'journey repeated-attempt rate');
        assertRate(data.errorRate, data.errorUsers, data.entered, 'journey error rate');

        const dateEnd = '2026-10-28';
        const dateStart = new Date(Date.UTC(2026, 9, 29 - period)).toISOString().slice(0, 10);
        data.steps.forEach((step, index) => {
          for (const field of countFields) assertCount(step[field], `${step.name} ${field}`);
          assert.equal(step.entered, step.completed + step.dropped, 'each step entrant completes or abandons that step');
          if (index < data.steps.length - 1) {
            assert.equal(step.completed, data.steps[index + 1].entered, 'only customers who finish one step enter the next');
          }
          assertRate(step.dropRate, step.dropped, step.entered, `${step.name} drop-off rate`);
          assertRate(step.repeatRate, step.repeatUsers, step.entered, `${step.name} repeated-attempt rate`);
          assertRate(step.errorRate, step.errorUsers, step.entered, `${step.name} error rate`);
          assert.ok(step.repeatUsers <= step.entered, 'a customer counts once per step in repeated attempts');
          assert.ok(step.errorUsers <= step.entered, 'a customer counts once per step in errors');
          assertPercent(step.previousDropRate, `${step.name} prior-period drop-off rate`);
          assert.ok(step.trend.length >= 2, 'the trend needs multiple observations');
          for (const value of step.trend) assertPercent(value, `${step.name} trend observation`);
          assert.equal(step.trend.at(-1), step.dropRate, 'the latest trend point matches the selected milestone');
          assert.ok(step.theme && step.hypothesis, 'a pattern has a named support theme and a hypothesis');
          for (const field of ['title', 'change', 'metric', 'guardrail']) {
            assert.ok(step.experiment[field]?.trim(), `the proposed experiment includes ${field}`);
          }

          assert.ok(step.comments.length > 0, 'each segment has relevant sample support evidence');
          const commentIds = new Set();
          for (const comment of step.comments) {
            assert.ok(SEGMENTS.includes(comment.segment), 'a comment belongs to a known customer segment');
            if (segment !== 'all') assert.equal(comment.segment, segment, 'comments respect the selected segment');
            assert.ok(comment.date >= dateStart && comment.date <= dateEnd, 'comments fall within the selected date range');
            assert.equal(comment.fictional, true, 'sample evidence is explicitly identified as fictional');
            assert.ok(comment.quote?.trim(), 'support evidence contains a usable comment');
            assert.ok(!commentIds.has(comment.id), 'support evidence has unique references per milestone');
            commentIds.add(comment.id);
          }

          assert.equal(step.segmentBreakdown.length, SEGMENTS.length, 'the comparison includes each customer segment');
          for (const breakdown of step.segmentBreakdown) {
            for (const field of countFields) assertCount(breakdown[field], `${breakdown.segment} ${field}`);
            for (const field of rateFields) assertPercent(breakdown[field], `${breakdown.segment} ${field}`);
            assert.equal(breakdown.entered, breakdown.completed + breakdown.dropped);
          }
        });

        assert.ok(data.steps.some(step => step.id === data.worstStep.id), 'the priority milestone belongs to this journey');
        assert.equal(data.worstStep.dropped, Math.max(...data.steps.map(step => step.dropped)), 'the priority milestone accounts for the largest number of lost customers');
      });
    }
  }
}

for (const journey of JOURNEYS) {
  for (const { value: period } of PERIODS) {
    test(`${journey.name} / ${period} days: all-customer totals equal the disjoint segment totals`, () => {
      const aggregate = getJourneyData(journey.id, 'all', period);
      const segments = SEGMENTS.map(segment => getJourneyData(journey.id, segment, period));
      for (const field of ['entered', 'completed', 'abandoned', 'repeatUsers', 'errorUsers', 'supportCount']) {
        assert.equal(aggregate[field], sum(segments, field), `${field} aggregates exactly across customer segments`);
      }
      aggregate.steps.forEach((step, index) => {
        const individualSteps = segments.map(data => data.steps[index]);
        for (const field of countFields) {
          assert.equal(step[field], sum(individualSteps, field), `${step.name} ${field} aggregates exactly`);
        }
        for (const breakdown of step.segmentBreakdown) {
          const selected = segments.find(data => data.segment === breakdown.segment).steps[index];
          for (const field of [...countFields, ...rateFields]) {
            assert.equal(breakdown[field], selected[field], `${breakdown.segment} comparison agrees with its filter`);
          }
        }
        assert.equal(step.comments.length, individualSteps.reduce((total, item) => total + item.comments.length, 0), 'the all-customer evidence includes each segment comment once');
      });
    });
  }
}
