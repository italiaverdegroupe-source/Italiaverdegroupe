// Run: node tests/landed-cost.test.mjs
// Proves the allocation basis is not cosmetic: the same shipment, costed by
// value instead of volume, reverses which specimen looks profitable.
import { costShipment, margin } from '../.test-build/landed-cost.mjs';

let failed = 0;
const near = (a, b, tol = 0.02) => Math.abs(a - b) <= tol;
const check = (name, ok, detail = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (detail ? '   ' + detail : ''));
  if (!ok) failed++;
};

// One 40ft container out of Puglia.
//  - a big ancient olive: cheap-ish to buy, enormous, eats the container
//  - a small sculpted olive: expensive to buy, compact
const EUR = 3.95;
const lines = [
  { product_ref: 'VG-OL-007', description: 'Ancient olive, 5 m',
    quantity: 4, unit_cost: 1200, cost_currency: 'EUR', fx_rate_to_aed: EUR,
    unit_volume_m3: 9, unit_weight_kg: 3800 },
  { product_ref: 'VG-OL-006', description: 'Bonsai-form olive, 1.8 m',
    quantity: 20, unit_cost: 520, cost_currency: 'EUR', fx_rate_to_aed: EUR,
    unit_volume_m3: 0.5, unit_weight_kg: 190 },
];

const byVolume = costShipment(lines, [
  { kind: 'freight',      amount: 4200,  currency: 'EUR', fx_rate_to_aed: EUR, allocation: 'volume' },
  { kind: 'customs_duty', amount: 8900,  currency: 'AED', fx_rate_to_aed: 1,   allocation: 'value'  },
  { kind: 'clearance',    amount: 1800,  currency: 'AED', fx_rate_to_aed: 1,   allocation: 'count'  },
]);

const byValue = costShipment(lines, [
  { kind: 'freight',      amount: 4200,  currency: 'EUR', fx_rate_to_aed: EUR, allocation: 'value' },
  { kind: 'customs_duty', amount: 8900,  currency: 'AED', fx_rate_to_aed: 1,   allocation: 'value' },
  { kind: 'clearance',    amount: 1800,  currency: 'AED', fx_rate_to_aed: 1,   allocation: 'count' },
]);

const bigVol   = byVolume.lines[0], smallVol   = byVolume.lines[1];
const bigVal   = byValue.lines[0],  smallVal   = byValue.lines[1];

console.log('\n  container: 36 m³ ancient olives (4) + 10 m³ bonsai olives (20)\n');
console.log('  freight by VOLUME  big AED', bigVol.landedUnitAed.toFixed(2),
            ' small AED', smallVol.landedUnitAed.toFixed(2));
console.log('  freight by VALUE   big AED', bigVal.landedUnitAed.toFixed(2),
            ' small AED', smallVal.landedUnitAed.toFixed(2));

// goods: big 4×1200×3.95 = 18,960 ; small 20×520×3.95 = 41,080 ; total 60,040
check('goods value in AED', near(byVolume.goodsAed, 60040, 1), byVolume.goodsAed.toFixed(2));

// volume: big 36 m³ of 46 m³ = 78.26%
check('big specimen carries 78% of the volume', near(bigVol.shareOfVolume, 36 / 46, 0.001),
      (bigVol.shareOfVolume * 100).toFixed(1) + '%');
// but only 31.6% of the value
check('and only 32% of the value', near(bigVol.shareOfValue, 18960 / 60040, 0.001),
      (bigVol.shareOfValue * 100).toFixed(1) + '%');

// freight AED 16,590 total; by volume the big tree takes 78.26% of it
check('freight by volume loads the bulky tree',
      near(bigVol.allocatedAed - bigVal.allocatedAed, 16590 * (36 / 46 - 18960 / 60040), 1),
      'difference AED ' + (bigVol.allocatedAed - bigVal.allocatedAed).toFixed(2));

// the practical consequence, at a fixed selling price
const SELL_BIG = 9500;
const mVol = margin(bigVol.landedUnitAed, SELL_BIG);
const mVal = margin(bigVal.landedUnitAed, SELL_BIG);
console.log('\n  selling the ancient olive at AED 9,500:');
console.log('    margin using volume-based freight :', mVol.marginPct + '%');
console.log('    margin using value-based freight  :', mVal.marginPct + '%');
check('value-based allocation overstates the margin on the bulky tree',
      mVal.marginPct > mVol.marginPct,
      `${mVal.marginPct}% vs ${mVol.marginPct}%`);

// nothing may be silently invented or lost
const allocatedTotal = byVolume.lines.reduce((s, l) => s + l.allocatedAed, 0);
check('every dirham of cost is allocated, none invented',
      near(allocatedTotal + byVolume.unallocatedAed, byVolume.costsAed, 0.05),
      allocatedTotal.toFixed(2) + ' vs ' + byVolume.costsAed.toFixed(2));

// a basis with no denominator must be reported, not spread arbitrarily
const noWeights = costShipment(
  [{ product_ref: 'X', quantity: 2, unit_cost: 100, cost_currency: 'AED',
     fx_rate_to_aed: 1, unit_volume_m3: null, unit_weight_kg: null }],
  [{ kind: 'freight', amount: 500, currency: 'AED', fx_rate_to_aed: 1, allocation: 'weight' }]);
check('a missing basis is flagged, not guessed',
      noWeights.unallocatedAed === 500 && noWeights.warnings.length === 1,
      noWeights.warnings[0] ?? '');

// a missing exchange rate must not silently become 1:1
const noFx = costShipment(
  [{ product_ref: 'Y', quantity: 1, unit_cost: 1000, cost_currency: 'EUR',
     fx_rate_to_aed: null, unit_volume_m3: 1, unit_weight_kg: 10 }], []);
check('a missing exchange rate is flagged, not assumed 1:1',
      noFx.goodsAed === 0 && noFx.warnings.some((w) => w.includes('exchange rate')));

// a foreign-currency cost left at 1:1 is an unfilled field, not a real rate
const parity = costShipment(
  [{ product_ref: 'Z', quantity: 1, unit_cost: 100, cost_currency: 'AED',
     fx_rate_to_aed: 1, unit_volume_m3: 1, unit_weight_kg: 1 }],
  [{ kind: 'freight', amount: 4200, currency: 'EUR', fx_rate_to_aed: 1, allocation: 'volume' }]);
check('a foreign currency left at 1:1 is flagged',
      parity.warnings.some((w) => w.includes('exchange rate of 1.00')),
      parity.warnings[0] ?? 'no warning');

console.log(failed ? `\n${failed} FAILED` : '\nAll landed-cost checks passed.');
process.exit(failed ? 1 : 0);
