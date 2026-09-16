/**
 * Landed cost for an import consignment.
 *
 * The decision that matters here is the allocation basis, and it is per cost
 * line rather than one rule for the whole shipment:
 *
 *   freight            → volume.  A container is sold by the space it holds.
 *                        A large cheap olive eats a quarter of the container;
 *                        a small expensive one barely registers. Spreading
 *                        freight by VALUE would load the cost onto the
 *                        expensive tree and make the cheap bulky one look
 *                        profitable — precisely backwards, and every price set
 *                        from those numbers inherits the error.
 *   customs duty       → value.   Duty is assessed on declared value.
 *   handling, clearance→ count.   Charged per piece or per movement.
 *   insurance          → value.   Cover follows what is insured.
 *
 * Currency is converted with the rate captured on the line, never a live rate:
 * recomputing a shipment from 2024 at today's rate would quietly rewrite the
 * margins already reported for it.
 */

export type Allocation = 'volume' | 'weight' | 'value' | 'count';

export type CostLine = {
  id?: string | number;
  kind: string;
  description?: string | null;
  amount: number;
  currency: string;
  fx_rate_to_aed: number;
  allocation: Allocation;
};

export type ShipmentLine = {
  id?: string | number;
  product_ref: string;
  description?: string | null;
  quantity: number;
  unit_cost: number;
  cost_currency: string;
  fx_rate_to_aed: number | null;
  unit_volume_m3: number | null;
  unit_weight_kg: number | null;
};

export type CostedLine = ShipmentLine & {
  goodsAed: number;          // purchase cost of the line, in AED
  allocatedAed: number;      // its share of every shipment cost
  landedTotalAed: number;
  landedUnitAed: number;
  shareOfVolume: number;     // 0..1, for showing the working
  shareOfValue: number;
};

export type CostedShipment = {
  lines: CostedLine[];
  goodsAed: number;
  costsAed: number;
  totalAed: number;
  totalVolumeM3: number;
  totalWeightKg: number;
  totalPieces: number;
  unallocatedAed: number;    // costs whose basis had no denominator
  warnings: string[];
};

const money = (n: number) => Math.round(n * 100) / 100;

/** The measure a given basis spreads over, for one line. */
function basisValue(line: ShipmentLine, basis: Allocation, goodsAed: number): number {
  switch (basis) {
    case 'volume': return (line.unit_volume_m3 ?? 0) * line.quantity;
    case 'weight': return (line.unit_weight_kg ?? 0) * line.quantity;
    case 'count':  return line.quantity;
    case 'value':  return goodsAed;
  }
}

export function costShipment(lines: ShipmentLine[], costs: CostLine[]): CostedShipment {
  const warnings: string[] = [];

  const goods = lines.map((l) => {
    const fx = l.fx_rate_to_aed ?? (l.cost_currency === 'AED' ? 1 : null);
    if (fx === null) {
      warnings.push(
        `${l.product_ref}: no exchange rate recorded for ${l.cost_currency}, its goods value is treated as 0.`);
    } else if (l.cost_currency !== 'AED' && fx === 1) {
      warnings.push(
        `${l.product_ref}: purchase currency is ${l.cost_currency} but the exchange rate is 1.00.`);
    }
    return money(l.unit_cost * l.quantity * (fx ?? 0));
  });

  const totals: Record<Allocation, number> = {
    volume: lines.reduce((s, l, i) => s + basisValue(l, 'volume', goods[i]), 0),
    weight: lines.reduce((s, l, i) => s + basisValue(l, 'weight', goods[i]), 0),
    count:  lines.reduce((s, l, i) => s + basisValue(l, 'count',  goods[i]), 0),
    value:  goods.reduce((s, g) => s + g, 0),
  };

  const allocated = lines.map(() => 0);
  let unallocated = 0;

  for (const c of costs) {
    // A foreign-currency cost left at 1:1 is almost always an unfilled field,
    // and it understates the landed cost by roughly the exchange rate — the
    // kind of error that only shows up as a margin that never materialises.
    if (c.currency !== 'AED' && (c.fx_rate_to_aed || 1) === 1) {
      warnings.push(
        `${c.kind}: ${c.currency} ${c.amount.toFixed(2)} carries an exchange rate of 1.00. ` +
        `Unless ${c.currency} really is at parity with AED, this understates the landed cost.`);
    }
    const amountAed = money(c.amount * (c.fx_rate_to_aed || 1));
    const denominator = totals[c.allocation];

    if (denominator <= 0) {
      // Spreading by a measure nobody recorded would invent numbers. Say so
      // instead, and leave the money visibly unallocated.
      unallocated += amountAed;
      warnings.push(
        `${c.kind}: allocated by ${c.allocation}, but no line carries a ${c.allocation} figure — ` +
        `AED ${amountAed.toFixed(2)} could not be spread.`);
      continue;
    }
    lines.forEach((l, i) => {
      const share = basisValue(l, c.allocation, goods[i]) / denominator;
      allocated[i] += amountAed * share;
    });
  }

  const costed: CostedLine[] = lines.map((l, i) => {
    const alloc = money(allocated[i]);
    const total = money(goods[i] + alloc);
    return {
      ...l,
      goodsAed: goods[i],
      allocatedAed: alloc,
      landedTotalAed: total,
      landedUnitAed: l.quantity > 0 ? money(total / l.quantity) : 0,
      shareOfVolume: totals.volume > 0 ? basisValue(l, 'volume', goods[i]) / totals.volume : 0,
      shareOfValue: totals.value > 0 ? goods[i] / totals.value : 0,
    };
  });

  const goodsAed = money(totals.value);
  const costsAed = money(costs.reduce((s, c) => s + c.amount * (c.fx_rate_to_aed || 1), 0));

  return {
    lines: costed,
    goodsAed,
    costsAed,
    totalAed: money(goodsAed + costsAed),
    totalVolumeM3: Math.round(totals.volume * 1000) / 1000,
    totalWeightKg: Math.round(totals.weight * 100) / 100,
    totalPieces: totals.count,
    unallocatedAed: money(unallocated),
    warnings,
  };
}

/** Margin on a selling price, given the landed unit cost. */
export function margin(landedUnitAed: number, sellingAed: number) {
  const profit = money(sellingAed - landedUnitAed);
  return {
    profitAed: profit,
    marginPct: sellingAed > 0 ? Math.round((profit / sellingAed) * 1000) / 10 : 0,
    markupPct: landedUnitAed > 0 ? Math.round((profit / landedUnitAed) * 1000) / 10 : 0,
  };
}

export const DEFAULT_ALLOCATION: Record<string, Allocation> = {
  freight: 'volume',
  insurance: 'value',
  customs_duty: 'value',
  clearance: 'count',
  handling: 'count',
  inland_transport: 'volume',
  storage: 'volume',
  inspection: 'count',
  other: 'value',
};
