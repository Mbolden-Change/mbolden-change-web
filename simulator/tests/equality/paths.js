/**
 * The paths the equality harness plays. See the simulator refresh spec,
 * "Checks > Numbers equality".
 */
'use strict';

const PRESETS = [
  'Maria — Single Mother',
  'James & Dorothy — Retired Couple',
  'The Johnsons — Working Family',
  'The Ramirez Family — Mixed-Status Family',
  'The Chen Family — Fully Undocumented',
  'The Carters — Self-Employed Family',
];
const NATIONAL = ['Rural / Small Town', 'Southern Metro', 'Midwest Metro', 'National Average', 'Northeast Metro', 'Western Metro', 'High-Cost Metro'];
const CA_REGIONS = ['Bay Area', 'Central Valley'];
const PATTERNS = ['first', 'last', 'alternating'];

// Preset households have no `children` field, so on the region step the
// reference build offers them two Medi-Cal answers ("Children only" and the
// CalWORKs question need household.children > 0). Unanswered is a third path.
const MEDI_CAL = {
  unanswered: [],
  all: ['Yes — whole family enrolled'],
  none: ['No one enrolled'],
};

// The Medi-Cal question appears for mixed-status and undocumented households.
function caAnswerSets(household) {
  if (/Ramirez|Chen/.test(household)) return Object.entries(MEDI_CAL).map(([m, a]) => ({ key: `medi-cal ${m}`, answers: a }));
  return [{ key: 'no questions', answers: [] }];
}

const BUILDERS = [
  { key: '1 adult, 1 child, $1,500', adults: 1, children: 1, income: 1500, status: 'citizen' },
  { key: '2 adults, 3 children, $2,200, mixed-status', adults: 2, children: 3, income: 2200, status: 'mixed' },
  { key: '2 adults, 2 children, $6,250', adults: 2, children: 2, income: 6250, status: 'citizen' },
  { key: '1 adult, no children, $1,200', adults: 1, children: 0, income: 1200, status: 'citizen' },
  // Not in the spec's list: covers the high-income "About this household" step.
  { key: '1 adult, no children, $12,000 (high-income step)', adults: 1, children: 0, income: 12000, status: 'citizen', gate: true },
];

function buildPaths() {
  const paths = [];
  for (const household of PRESETS) {
    for (const region of NATIONAL) for (const pattern of PATTERNS) paths.push({ id: `${household} | ${region} | CA off | ${pattern}`, group: household + ' national', household, region, ca: false, pattern });
    for (const region of CA_REGIONS)
      for (const set of caAnswerSets(household))
        for (const pattern of PATTERNS)
          paths.push({ id: `${household} | ${region} | CA on, ${set.key} | ${pattern}`, group: household + ' CA', household, region, ca: true, answers: set.answers, pattern });
  }
  for (const b of BUILDERS) {
    const patterns = b.gate ? ['first'] : PATTERNS;
    for (const pattern of patterns) paths.push({ id: `Build Your Own: ${b.key} | CA off | ${pattern}`, group: 'builder ' + b.key, builder: b, expectGate: !!b.gate, pattern });
  }
  // "Previous round": go back from round 3 and play on (not in the spec's list; covers the feature).
  for (const [household, region, ca, answers] of [
    ['Maria — Single Mother', 'National Average', false, []],
    ['The Ramirez Family — Mixed-Status Family', 'Bay Area', true, ['No one enrolled']],
    ['The Chen Family — Fully Undocumented', 'Central Valley', true, ['Yes — whole family enrolled']],
  ])
    for (const pattern of ['last', 'alternating'])
      paths.push({ id: `${household} | ${region} | CA ${ca ? 'on' : 'off'} | ${pattern} | with Previous round`, group: 'previous ' + household, household, region, ca, answers, pattern, goBack: true });
  return paths;
}

module.exports = { buildPaths };
