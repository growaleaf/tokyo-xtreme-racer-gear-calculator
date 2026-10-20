// Headless known-answer tests. Run: node test.js
// Every scenario is worked by hand against the wheel-speed formula before being encoded here:
// speed(mph) = (rpm * circumferenceIn * 60) / (gearRatio * finalDrive * 63360)
var calc = require("./calc.js");

var failures = 0;

function assertClose(actual, expected, label, tol) {
  tol = tol || 0.01;
  if (Math.abs(actual - expected) > tol) {
    failures++;
    console.log("FAIL " + label + " — expected " + expected + ", got " + actual);
  } else {
    console.log("PASS " + label + " (" + actual + ")");
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    failures++;
    console.log("FAIL " + label + " — expected " + expected + ", got " + actual);
  } else {
    console.log("PASS " + label + " (" + actual + ")");
  }
}

// --- gearTopSpeedMph: 5 hand-computed known-answer scenarios ---

// Scenario 1: rpm=3000, circumference=28in*pi=87.9646in, gear=1.0, final=3.73.
// Hand calc: num = 3000*87.9646*60 = 15,833,627. denom = 1.0*3.73*63360 = 236,332.8.
// speed = 15,833,627 / 236,332.8 = 66.997 mph.
// Cross-checked independently against a third-party RPM/tire/gearing speed calculator
// (youcanic.com's worked example: 3000rpm, 3.73 final, 1.0 top gear, 28in tire -> ~67mph).
(function scenario1() {
  var circ = 28 * Math.PI;
  var r = calc.gearTopSpeedMph({ rpm: 3000, circumferenceIn: circ, gearRatio: 1.0, finalDrive: 3.73 });
  assertClose(r, 66.997, "Scenario 1 gearTopSpeedMph");
})();

// Scenario 2: rpm=7000, circumference=75in, gear=1.0, final=3.0.
// Hand calc: num = 7000*75*60 = 31,500,000. denom = 1.0*3.0*63360 = 190,080.
// speed = 31,500,000 / 190,080 = 165.720 mph.
(function scenario2() {
  var r = calc.gearTopSpeedMph({ rpm: 7000, circumferenceIn: 75, gearRatio: 1.0, finalDrive: 3.0 });
  assertClose(r, 165.720, "Scenario 2 gearTopSpeedMph");
})();

// Scenario 3: rpm=6500, circumference=80in, gear=2.0, final=4.1.
// Hand calc: num = 6500*80*60 = 31,200,000. denom = 2.0*4.1*63360 = 519,552.
// speed = 31,200,000 / 519,552 = 60.052 mph.
(function scenario3() {
  var r = calc.gearTopSpeedMph({ rpm: 6500, circumferenceIn: 80, gearRatio: 2.0, finalDrive: 4.1 });
  assertClose(r, 60.052, "Scenario 3 gearTopSpeedMph");
})();

// Scenario 4: rpm=8000, circumference=70in, gear=0.8, final=3.5.
// Hand calc: num = 8000*70*60 = 33,600,000. denom = 0.8*3.5*63360 = 177,408.
// speed = 33,600,000 / 177,408 = 189.394 mph.
(function scenario4() {
  var r = calc.gearTopSpeedMph({ rpm: 8000, circumferenceIn: 70, gearRatio: 0.8, finalDrive: 3.5 });
  assertClose(r, 189.394, "Scenario 4 gearTopSpeedMph");
})();

// Scenario 5: rpm=1000, circumference=75in, gear=3.5, final=4.1 (low-rpm/tall-ratio edge case).
// Hand calc: num = 1000*75*60 = 4,500,000. denom = 3.5*4.1*63360 = 909,216.
// speed = 4,500,000 / 909,216 = 4.949 mph.
(function scenario5() {
  var r = calc.gearTopSpeedMph({ rpm: 1000, circumferenceIn: 75, gearRatio: 3.5, finalDrive: 4.1 });
  assertClose(r, 4.949, "Scenario 5 gearTopSpeedMph");
})();

// Invalid-input guard: any non-positive input returns null, never NaN/Infinity on the page.
(function scenarioInvalid() {
  assertEqual(calc.gearTopSpeedMph({ rpm: 0, circumferenceIn: 75, gearRatio: 1, finalDrive: 1 }), null, "Zero RPM guard");
  assertEqual(calc.gearTopSpeedMph({ rpm: 3000, circumferenceIn: 75, gearRatio: 0, finalDrive: 1 }), null, "Zero gear ratio guard");
})();

// --- speedPerGear: wraps gearTopSpeedMph across an array of ratios ---

(function scenarioPerGear() {
  var rows = calc.speedPerGear({ rpm: 7000, circumferenceIn: 75, finalDrive: 3.0, gearRatios: [3.2, 2.1, 1.0] });
  assertEqual(rows.length, 3, "speedPerGear row count");
  assertEqual(rows[2].gear, 3, "speedPerGear gear numbering");
  // Third row (ratio 1.0) matches Scenario 2's math exactly (same rpm/circ/final/ratio).
  assertClose(rows[2].mph, 165.720, "speedPerGear row 3 matches Scenario 2");
})();

// --- quarterMileEstimate: Huntington formula, 2 hand-computed scenarios ---
// ET = 6.290 * (weightLb/hp)^(1/3) seconds. trapMph = 224 * (hp/weightLb)^(1/3) mph.

// Scenario Q1: weight=3000lb, hp=300. ratio = 10. cube root of 10 = 2.15443.
// ET = 6.290 * 2.15443 = 13.551s. hp/weight = 0.1, cube root = 0.464159. trap = 224*0.464159 = 103.972mph.
(function scenarioQ1() {
  var r = calc.quarterMileEstimate({ weightLb: 3000, hp: 300 });
  assertClose(r.etSeconds, 13.551, "Scenario Q1 etSeconds");
  assertClose(r.trapMph, 103.972, "Scenario Q1 trapMph");
})();

// Scenario Q2: weight=2500lb, hp=500. ratio = 5. cube root of 5 = 1.70998.
// ET = 6.290 * 1.70998 = 10.756s. hp/weight = 0.2, cube root = 0.584804. trap = 224*0.584804 = 130.996mph.
(function scenarioQ2() {
  var r = calc.quarterMileEstimate({ weightLb: 2500, hp: 500 });
  assertClose(r.etSeconds, 10.756, "Scenario Q2 etSeconds");
  assertClose(r.trapMph, 130.996, "Scenario Q2 trapMph");
})();

if (failures > 0) {
  console.log(failures + " test(s) failed.");
  process.exit(1);
} else {
  console.log("All tests passed.");
}
