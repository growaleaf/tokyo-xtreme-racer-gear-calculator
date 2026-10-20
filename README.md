# Tokyo Xtreme Racer — Gear Ratio & Speed-Per-Gear Calculator (GCT-022)

Single static page, `index.html` + `calc.js`, no build step, no dependencies, no backend, no
account/login.

## What it does

1. **Speed-per-gear chart.** Player enters tire circumference (inches), final drive ratio, up to 6
   gear ratios, and redline RPM — all read off their own in-game transmission tuning screen. The
   page computes top speed at redline for each gear using the standard wheel-speed formula (see
   Data sources). This alone answers the "gearing chart like Forza Horizon's" ask from the
   confirmed-demand research without needing any game-specific sourcing.
2. **Quarter-mile estimate (optional).** If the player also enters power (hp) and weight (lb), the
   page shows an estimated quarter-mile ET and trap speed using the Huntington power-to-weight
   approximation (see Data sources). Explicitly labeled as a 1950s-60s drag-strip curve fit, not a
   measurement of this game's actual drivetrain/drag/tire-grip/AWD-transfer model.

No 0-60 or 0-100 time is shown — see "What was dropped" below.

## Data sources

**Wheel-speed formula (fetched directly 2026-10-20):**

- `youcanic.com/vehicle-speed-rpm-calculator` and `firgelliauto.com`'s gear-ratio speed calculator
  — both independently state speed(mph) = engine RPM × π × tire diameter(in) ÷ (gear ratio × final
  drive × 1,056). This is algebraically identical to this tool's formula (speed = RPM ×
  circumference × 60 ÷ (gear ratio × final drive × 63,360)) once tire diameter is expressed as
  circumference (π × diameter) and the two unit constants are reconciled (63,360 ÷ 60 = 1,056).
- A worked example from youcanic.com (3,000 RPM, 3.73 final drive, 1.0 top gear, 28in tire → ~67
  mph) was independently re-derived by hand against this tool's exact formula and matched to
  within rounding (66.997 mph) — encoded as `test.js` Scenario 1.
- Public-domain driveline physics, not a Tokyo Xtreme Racer constant — no in-game gear-ratio
  numbers are hardcoded anywhere in the calculator.

**Quarter-mile ET / trap-speed approximation (fetched directly 2026-10-20):**

- `omnicalculator.com/physics/quarter-mile` and `stealth316.com`'s 1/4-mile ET & MPH calculators —
  both independently state the same formula and the same attribution: ET = 6.290 ×
  (weight_lb/hp)^(1/3) seconds, trap speed = 224 × (hp/weight_lb)^(1/3) mph, credited to drag-racing
  writer Roger Huntington, who fit it from roughly 40-50 real road-and-strip test runs in the
  1950s-60s.
- Both sources also describe two later refinements (Fox 1973: 6.269/230; Hale 1980s: 5.825/234)
  that agree with Huntington's original constants within roughly 5%. This tool uses the original
  Huntington constants because they are the most consistently and specifically attributed across
  independent sources — the later variants' exact provenance was less consistent between sources.
- This is an empirical curve fit across many different real road/strip cars from decades of
  drag-racing data, not a physics simulation of any specific car and not a Tokyo-Xtreme-Racer
  claim. The page states explicitly that it cannot know this game's actual drag/tire-grip/AWD
  model and should be read as a ballpark, not a prediction of the game's own lap timer.

## What was dropped, and why (failure protocol)

**0-60 / 0-100 time.** Searched for a public formula deriving 0-60 or 0-100 time from
power-to-weight ratio alone, comparably attested to the Huntington quarter-mile formula. What
turned up instead: a Grassroots Motorsports forum rule-of-thumb with units that don't resolve to a
time, an "EveryCalculators" formula (`0-60 ≈ ET×0.3 + ET×(60/finalSpeed)`) with no stated
derivation or named source, and general agreement among drag-racing sources that 0-60 depends on
launch traction in a way the quarter-mile-based formulas don't capture. None of this cleared the
same sourcing bar as the quarter-mile formula, so per this lane's failure protocol, 0-60/0-100 was
dropped rather than shipped on a fabricated or uncited formula. The speed-per-gear chart and the
quarter-mile estimate do not depend on it, and the speed-per-gear chart alone fully answers one of
the two sourced community asks (the Forza-style gearing chart request).

**Per-car reference setups.** `treyexgaming.com`'s Tokyo Xtreme Racer tuning guide publishes a
specific EK9 Civic Type R "Spoon Close Ratio Gear Set" (1st 2.533, 2nd 1.944, 3rd 1.591, 4th 1.280,
5th 1.033, final 4.400). A second search specifically for these numbers found only the same site
repeating them, plus Steam Community discussion threads giving general qualitative gearing advice
("lower final drive trades top speed for acceleration," "~4.1 final is a reasonable balance") with
no matching per-car figures. No second independent source could be found stating the same specific
EK9 numbers, so per the charter's 2-source rule for any hardcoded per-car figure, no reference
panel is shown. Every number driving the calculator is typed in by the player — no default value
anywhere resembles a specific car's gear ratios, power, or weight (all three fields start at 0).

## What was held back as player-input rather than hardcoded

Every number that drives either calculator is a player-entered field. The charter specifically
forbids defaulting gear ratios, power, or weight to any value — those 8 fields (6 gear-ratio slots,
power, weight) all start at 0, so the speed-per-gear table and quarter-mile section are empty until
the player types in their own garage numbers. Tire circumference, final drive, and redline RPM are
outside that restriction and start pre-filled with generic round numbers (75in, 4.1, 7500rpm) purely
as non-car-specific placeholders, the same way `TrainFeverRouteCalculator` prefills its distance/
speed/frequency fields — none of the three match any specific car's published spec.

## Tests

`node test.js` — 5 required hand-calculated known-answer scenarios for the speed-per-gear formula
(plus 2 guard-clause checks, a `speedPerGear` wrapper check, and 2 bonus hand-calculated scenarios
for the quarter-mile formula), 14 assertions total, all passing. Key scenarios are re-run in-browser
on page load and shown as a visible self-test line under Sources.

`python3 Tools/slop_lint.py index.html calc.js test.js` — clean, 0 findings.

`grep -ioE "\b(compliant|certified|safe|approved|guaranteed|best|optimal)\b" index.html calc.js
test.js` — zero matches.

Artifact rendered via headless Chrome (`--headless --screenshot`) and visually inspected at two
viewport heights (prefilled-gears view and true-zero-defaults view) before calling this done.
