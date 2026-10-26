export interface NetMeterResult {
  /** Units billed each month after netting and banked credits */
  billedUnits: number[];
  /** Credit balance carried at the end of each month */
  creditAfter: number[];
  yearEndSurplus: number;
  billBefore: number;
  billAfter: number;
  savings: number;
  /** Share of annual consumption covered by solar */
  coverage: number;
}

/**
 * Month-by-month net metering with banked credits. The settlement year runs
 * April to March (Indian financial year); surplus left at year end is paid at
 * the feed-in rate. Fixed charges are unaffected by solar and are excluded.
 */
export function netMetering(consumption: number[], generation: number[], tariff: number, feedIn: number): NetMeterResult {
  const order = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2];
  const billed = new Array(12).fill(0);
  const creditAfter = new Array(12).fill(0);
  let credit = 0;
  for (const m of order) {
    const c = consumption[m];
    const g = generation[m];
    if (g >= c) {
      credit += g - c;
    } else {
      const deficit = c - g;
      const used = Math.min(credit, deficit);
      credit -= used;
      billed[m] = deficit - used;
    }
    creditAfter[m] = credit;
  }
  const totalC = consumption.reduce((a, b) => a + b, 0);
  const totalBilled = billed.reduce((a, b) => a + b, 0);
  const billBefore = totalC * tariff;
  const billAfter = totalBilled * tariff - credit * feedIn;
  return {
    billedUnits: billed,
    creditAfter,
    yearEndSurplus: credit,
    billBefore,
    billAfter,
    savings: billBefore - billAfter,
    coverage: totalC > 0 ? 1 - totalBilled / totalC : 0,
  };
}
