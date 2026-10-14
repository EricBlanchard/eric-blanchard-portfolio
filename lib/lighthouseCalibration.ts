/**
 * CPU calibration for Lighthouse, so the performance budgets measure the same simulated phone
 * whatever machine runs them.
 *
 * Lighthouse slows the CPU 4x by default, which assumes the host is a high-end desktop
 * (benchmark index 1500–2000) and lands on a mid-tier phone. Shared CI runners are often
 * "low-end desktop" class (1000–1500), where 4x simulates a much slower phone than intended
 * and Total Blocking Time swings from run to run. Lighthouse's docs say to calibrate the
 * multiplier to the host instead:
 * https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md#cpu-throttling
 *
 * The multiplier here keeps the simulated device at the one Lighthouse's default aims for
 * (index 1750 / 4). It never goes above Lighthouse's 4x, so a fast machine gets the stock
 * setting, and never below 1x.
 */

/** Middle of the "high-end desktop" bracket that Lighthouse's 4x default assumes. */
export const REFERENCE_BENCHMARK_INDEX = 1750;
export const DEFAULT_MULTIPLIER = 4;
/** The benchmark index of the device the budgets are meant to simulate. */
export const TARGET_BENCHMARK_INDEX = REFERENCE_BENCHMARK_INDEX / DEFAULT_MULTIPLIER;

/** The CPU slowdown to use on a host with this benchmark index, to one decimal place. */
export function cpuSlowdownFor(benchmarkIndex: number): number {
  if (!Number.isFinite(benchmarkIndex) || benchmarkIndex <= 0) return DEFAULT_MULTIPLIER;
  const exact = benchmarkIndex / TARGET_BENCHMARK_INDEX;
  return Math.round(Math.min(DEFAULT_MULTIPLIER, Math.max(1, exact)) * 10) / 10;
}

/** Median of a few benchmark readings; a single reading is noisy. */
export function medianOf(values: number[]): number {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length === 0) return Number.NaN;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}
