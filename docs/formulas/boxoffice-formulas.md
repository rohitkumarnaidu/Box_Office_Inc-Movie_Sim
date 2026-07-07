# Box Office Formulas

## Movie Verdicts (ROI Thresholds)

Every released movie receives a **verdict** — a human-readable category of financial success — derived from its **return on investment (ROI)**:

\[
ROI = \frac{\text{worldwideGross} - (\text{productionBudget} + \text{marketingBudget})}{\text{productionBudget} + \text{marketingBudget}}
\]

### Threshold Table

| ROI Range                       | Verdict               |
|---------------------------------|-----------------------|
| ROI < -0.5                      | DISASTER              |
| -0.5 ≤ ROI < 0                  | FLOP                  |
| 0 ≤ ROI ≤ 0.25                 | AVERAGE               |
| 0.25 < ROI ≤ 1.0               | HIT                   |
| 1.0 < ROI ≤ 3.0                | BLOCKBUSTER           |
| ROI > 3.0                       | ALL_TIME_BLOCKBUSTER  |

### Boundary Notes

- **DISASTER vs FLOP**: The threshold is `-0.5` (exclusive). A movie with ROI of exactly `-0.5` is a FLOP, not a DISASTER.
- **FLOP vs AVERAGE**: The threshold is `0` (exclusive). Breaking even (ROI = 0) earns an AVERAGE verdict, not FLOP.
- **AVERAGE vs HIT**: The threshold is `0.25` (inclusive for AVERAGE). Exactly 25% ROI is still AVERAGE; anything above is a HIT.
- **HIT vs BLOCKBUSTER**: The threshold is `1.0` (inclusive for HIT). Exactly 100% ROI is still a HIT.
- **BLOCKBUSTER vs ALL_TIME_BLOCKBUSTER**: The threshold is `3.0` (inclusive for BLOCKBUSTER). Exactly 300% ROI is still a BLOCKBUSTER.

### Source of Truth

Threshold logic lives in **`backend/src/constants/verdicts.js`** and is exported as the `getVerdict(roi)` function. Both `boxOfficeEngine.js` and `rivalStudioEngine.js` import this single function — they **must never** define their own verdict thresholds.

### Design Rationale

The thresholds reflect a logarithmic perception of success:
- Negative ROI is punishing (flop ends at 0, disaster below -0.5)
- Breaking even (ROI ≈ 0) still only earns "AVERAGE" — not a win
- Doubling investment (ROI ≥ 1.0) is a clear "HIT"
- Tripling (ROI ≥ 3.0) is "BLOCKBUSTER" — exceptional but achievable
- ROI ≥ 10.0 is reserved for cultural phenomena ("ALL_TIME_BLOCKBUSTER")

These thresholds apply uniformly to both player-owned and rival-studio movies.
Any per-faction asymmetry should be expressed through the ROI calculation itself,
not through different verdict mappings.

---

## Opening Weekend

The opening weekend gross is the foundation of the box office model:

\[
\text{openingWeekend} = (\text{openingBase} + \text{starPower} + \text{marketingBoost}) \times (\text{hypeFactor} + 0.4) \times \text{variance} \times \text{marketMultiplier} \times \text{franchiseMultiplier} \times \text{demographicMultiplier}
\]

Where:

- **openingBase** = `productionBudget × 0.12`
- **starPower** = `(actorPopularity / 100) × (productionBudget × 0.18)`
- **marketingBoost** = `marketingBudget × 0.5`
- **hypeFactor** = `hype / 100`
- **variance** = random value between 0.7 and 1.3 (`0.7 + Math.random() × 0.6`)
- **marketMultiplier** = combined genre-trend multiplier from trendEngine (defaults to 1)
- **franchiseMultiplier** = `1 + min(0.5, (sequelNumber - 1) × 0.1)` — +10% per prior sequel, capped at +50%
- **demographicMultiplier** = audience demographic alignment multiplier (defaults to 1)

## Worldwide Gross

\[
\text{worldwideGross} = \text{openingWeekend} \times (1.5 + \text{legs}) \times \text{variance}
\]

Where:

- **legs** = `audienceFactor × 5 + criticFactor × 2 + randomValue(0–2)`
- **variance** = random value between 0.8 and 1.2 (`0.8 + Math.random() × 0.4`)
- **audienceFactor** = `audienceScore / 100`
- **criticFactor** = `criticScore / 100`

Higher audience scores produce stronger "legs" (longer theatrical runs).

## Domestic / International Split

- **domesticGross** = `worldwideGross × 0.45`
- **internationalGross** = `worldwideGross − domesticGross` (55%)

## Profit & ROI

\[
\text{profit} = \text{worldwideGross} - (\text{productionBudget} + \text{marketingBudget})
\]

\[
\text{ROI} = \frac{\text{profit}}{\text{totalBudget}}
\]

If total budget is 0 (edge case), ROI falls back to `worldwideGross / 1,000,000`.
