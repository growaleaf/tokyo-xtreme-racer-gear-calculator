// Tokyo Xtreme Racer gear ratio / speed-per-gear math. Two independent pieces:
// 1) standard wheel-speed formula (public-domain driveline physics, not a game-specific
//    constant) — top speed at redline for any gear, given tire circumference, that gear's
//    ratio, and the final drive ratio. See README for two independently-fetched sources.
// 2) the Huntington power-to-weight quarter-mile ET / trap-speed approximation, a widely-cited
//    1950s-60s drag-strip empirical fit — NOT a measurement of this game's drivetrain/drag
//    model. See README for sourcing and the honesty caveat this carries.
(function (root) {
  "use strict";

  var INCHES_PER_MILE = 63360;

  // speed(mph) = (engineRPM * wheelCircumferenceIn * 60) / (gearRatio * finalDrive * 63360)
  // Derivation: engineRPM / (gearRatio * finalDrive) = wheel RPM. wheel RPM * circumference(in)
  // = inches traveled per minute. * 60 = inches per hour. / 63360 (inches per mile) = mph.
  function gearTopSpeedMph(input) {
    var rpm = input.rpm;
    var circumferenceIn = input.circumferenceIn;
    var gearRatio = input.gearRatio;
    var finalDrive = input.finalDrive;

    if (!(rpm > 0) || !(circumferenceIn > 0) || !(gearRatio > 0) || !(finalDrive > 0)) {
      return null;
    }

    return (rpm * circumferenceIn * 60) / (gearRatio * finalDrive * INCHES_PER_MILE);
  }

  // One top-speed figure per gear in the supplied array (up to 6), all at the player's entered
  // redline RPM.
  function speedPerGear(input) {
    var rpm = input.rpm;
    var circumferenceIn = input.circumferenceIn;
    var finalDrive = input.finalDrive;
    var gearRatios = input.gearRatios || [];

    return gearRatios.map(function (ratio, i) {
      return {
        gear: i + 1,
        ratio: ratio,
        mph: gearTopSpeedMph({ rpm: rpm, circumferenceIn: circumferenceIn, gearRatio: ratio, finalDrive: finalDrive })
      };
    });
  }

  // Huntington's quarter-mile approximation, fit empirically from 1950s-60s drag-strip data
  // (weight in lb, including driver): ET = 6.290 * (weight/hp)^(1/3) seconds,
  // trap speed = 224 * (hp/weight)^(1/3) mph. This is a rough fit across many different cars, not
  // a physics simulation — it ignores traction, gearing, aerodynamics, and launch technique
  // entirely. See README for sourcing and for why a separate 0-60/0-100 figure is NOT provided
  // (no comparably-attested public formula was found for those from power-to-weight alone).
  var HUNTINGTON_ET_CONST = 6.290;
  var HUNTINGTON_TRAP_CONST = 224;

  function quarterMileEstimate(input) {
    var weightLb = input.weightLb;
    var hp = input.hp;

    if (!(weightLb > 0) || !(hp > 0)) {
      return null;
    }

    var etSeconds = HUNTINGTON_ET_CONST * Math.pow(weightLb / hp, 1 / 3);
    var trapMph = HUNTINGTON_TRAP_CONST * Math.pow(hp / weightLb, 1 / 3);

    return { etSeconds: etSeconds, trapMph: trapMph };
  }

  var API = {
    gearTopSpeedMph: gearTopSpeedMph,
    speedPerGear: speedPerGear,
    quarterMileEstimate: quarterMileEstimate,
    INCHES_PER_MILE: INCHES_PER_MILE,
    HUNTINGTON_ET_CONST: HUNTINGTON_ET_CONST,
    HUNTINGTON_TRAP_CONST: HUNTINGTON_TRAP_CONST
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = API;
  } else {
    root.TXRCALC = API;
  }
})(typeof window !== "undefined" ? window : this);
