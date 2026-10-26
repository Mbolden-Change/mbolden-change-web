'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  REGIONS,
  POLICY_ROUNDS,
  CA_POLICY_ROUNDS,
  TRADEOFF_OPTIONS,
  adjustExpenses,
  applyCALayer,
  getCABufferForRound,
  getCashBenefitTotal,
  getExpenseTotal,
} from '@/lib/simulator/model'
import IntroScreen from './IntroScreen'
import HouseholdSelect from './HouseholdSelect'
import RegionSelect from './RegionSelect'
import HouseholdIntro from './HouseholdIntro'
import PolicyRound from './PolicyRound'
import ResultsScreen from './ResultsScreen'
import PlayBar, { ScreenStrip } from './PlayBar'
import styles from './Simulator.module.scss'

const STRIP_LABELS = {
  select: 'Choose a household',
  regionSelect: 'Where does this family live?',
  results: 'Simulation complete',
}

/**
 * The Safety Net Simulator. State and handlers are the reference build's App,
 * unchanged; everything below them is presentation.
 */
export default function Simulator() {
  // ---- BEGIN VERBATIM reference lines 11198-11337 ----
      const [screen, setScreen] = useState("intro");
      const [household, setHousehold] = useState(null);
      const [region, setRegion] = useState(null);
      const [adjustedExpenses, setAdjustedExpenses] = useState({});
      const [currentRound, setCurrentRound] = useState(0);
      const [currentBenefits, setCurrentBenefits] = useState({});
      const [qualityScore, setQualityScore] = useState(100);
      const [allChoices, setAllChoices] = useState([]);
      const [skippedRounds, setSkippedRounds] = useState([]);
      const [qolHistory, setQolHistory] = useState([]);
      const [roundSnapshots, setRoundSnapshots] = useState([]);
      const [hasCompletedSim, setHasCompletedSim] = useState(false);
      const [caState, setCaState] = useState(false);
      const [medicalEnrolledPreFreeze, setMedicalEnrolledPreFreeze] = useState(null); // null = unanswered, "all" | "children-only" | "none"
      const [calworksApplied, setCalworksApplied] = useState(null); // null = unanswered (treated as not applied for mixed-status)

      useEffect(() => { setTimeout(() => { window.scrollTo(0, 0); }, 50); }, [screen, currentRound]);

      const restart = useCallback(() => {
        setScreen("select"); setHousehold(null); setRegion(null); setAdjustedExpenses({});
        setCurrentRound(0); setCurrentBenefits({}); setQualityScore(100); setAllChoices([]); setSkippedRounds([]); setQolHistory([]); setRoundSnapshots([]); setCaState(false); setMedicalEnrolledPreFreeze(null); setCalworksApplied(null);
      }, []);

      const selectHousehold = useCallback((hh) => {
        let selectedHH = hh;
        if (hh.isCustom && caState) {
          selectedHH = applyCALayer(hh, hh.customRegion || REGIONS.find(r => r.id === "national-avg"), { medicalEnrolledPreFreeze, calworksApplied });
        }
        setHousehold(selectedHH);
        if (selectedHH.isCustom) {
          // Custom households have region-adjusted expenses already baked in
          const region = selectedHH.customRegion || REGIONS.find(r => r.id === "national-avg");
          setRegion(region);
          setAdjustedExpenses({ ...selectedHH.expenses });
          setCurrentBenefits({ ...selectedHH.benefits });
          const bq = selectedHH.baselineQuality || 100;
          const caBonus = caState ? Math.min(8, Object.keys(selectedHH.caBenefits || {}).filter(k => (selectedHH.caBenefits[k] || 0) > 0).length * 2) : 0;
          const adjustedBq = Math.min(97, bq + caBonus);
          setQualityScore(adjustedBq);
          setAllChoices([]);
          setSkippedRounds([]);
          setQolHistory([{ label: "Start", score: adjustedBq }]);
          setCurrentRound(0);
          setScreen("householdIntro");
        } else {
          setScreen("regionSelect");
        }
      }, [caState, medicalEnrolledPreFreeze, calworksApplied]);

      const rounds = useMemo(() => {
        if (!household) return POLICY_ROUNDS;
        let applicableRounds = POLICY_ROUNDS.filter((r) => !r.appliesTo || r.appliesTo(household));
        if (caState && household) {
          const caRounds = CA_POLICY_ROUNDS.filter((r) => !r.appliesTo || r.appliesTo(household));
          applicableRounds = [...applicableRounds, ...caRounds];
        }
        return applicableRounds;
      }, [household, caState]);

      const selectRegion = useCallback((r) => {
        setRegion(r);
        let hh = household;
        if (caState) {
          hh = applyCALayer(household, r, { medicalEnrolledPreFreeze, calworksApplied });
          setHousehold(hh);
        }
        const adj = adjustExpenses(hh.expenses, r);
        setAdjustedExpenses(adj);
        setCurrentBenefits({ ...hh.benefits });
        const bq = hh.baselineQuality || 100;
        // CA safety net provides a small stability buffer
        const caBonus = caState ? Math.min(8, Object.keys(hh.caBenefits || {}).filter(k => (hh.caBenefits[k] || 0) > 0).length * 2) : 0;
        const adjustedBq = Math.min(97, bq + caBonus);
        setQualityScore(adjustedBq); setAllChoices([]); setSkippedRounds([]); setQolHistory([{ label: "Start", score: adjustedBq }]); setCurrentRound(0);
        setScreen("householdIntro");
      }, [household, caState, medicalEnrolledPreFreeze, calworksApplied]);

      const handleRoundChoice = useCallback((choices, lostAmount, effectiveCut, awarenessQualityPenalty = 0) => {
        setRoundSnapshots((prev) => [...prev, { benefits: { ...currentBenefits }, quality: qualityScore, choices: [...allChoices], skipped: [...skippedRounds], history: [...qolHistory] }]);
        const round = rounds[currentRound];
        const keys = Array.isArray(round.programKey) ? round.programKey : [round.programKey];

        // CA protection: determine which keys are shielded from cuts
        const caBuffer = getCABufferForRound(round.id, household);
        const caProtectedKeys = (caBuffer && caBuffer.protectedKeys) || [];
        const activeKeys = keys.filter(k => !caProtectedKeys.includes(k));

        if (effectiveCut === 0 && !round.perKeyCut) {
          const wasAffected = awarenessQualityPenalty > 0 || Object.keys(choices).length > 0;
          if (!wasAffected) setSkippedRounds((p) => [...p, round.id]);
          setAllChoices((p) => [...p, choices]);
          if (awarenessQualityPenalty > 0) setQualityScore((p) => Math.max(0, p - awarenessQualityPenalty));
          const tradeoffPenalty = Object.entries(choices).reduce((s, [a, oid]) => {
            const opt = (TRADEOFF_OPTIONS[a] || []).find((o) => o.id === oid);
            return s + (opt ? opt.severity * 4 : 0);
          }, 0);
          if (tradeoffPenalty > 0) setQualityScore((p) => Math.max(0, p - tradeoffPenalty));
          return;
        }
        setCurrentBenefits((prev) => {
          const next = { ...prev };
          if (round.perKeyCut) {
            activeKeys.forEach((k) => { const pct = round.perKeyCut[k] || 0; if (next[k] !== undefined) next[k] = Math.max(0, Math.round(next[k] * (1 - pct / 100))); });
          } else {
            activeKeys.forEach((k) => { if (next[k] !== undefined) next[k] = Math.max(0, Math.round(next[k] * (1 - effectiveCut / 100))); });
          }
          return next;
        });
        const penalty = Object.entries(choices).reduce((s, [a, oid]) => {
          const opt = (TRADEOFF_OPTIONS[a] || []).find((o) => o.id === oid);
          return s + (opt ? opt.severity * 4 : 0);
        }, 0);
        setQualityScore((p) => Math.max(0, p - penalty));
        setAllChoices((p) => [...p, choices]);
      }, [currentRound, rounds, currentBenefits, qualityScore, allChoices, skippedRounds, qolHistory, household]);

      const advanceRound = useCallback(() => {
        setQolHistory((h) => [...h, { label: rounds[currentRound]?.chartLabel || rounds[currentRound]?.title?.split(" ")[0] || `R${currentRound + 1}`, score: qualityScore }]);
        if (currentRound + 1 >= rounds.length) { setScreen("results"); setHasCompletedSim(true); }
        else setCurrentRound((r) => r + 1);
      }, [currentRound, rounds, qualityScore]);

      const goBackRound = useCallback(() => {
        if (currentRound === 0 || roundSnapshots.length === 0) return;
        const snap = roundSnapshots[roundSnapshots.length - 1];
        setCurrentBenefits(snap.benefits);
        setQualityScore(snap.quality);
        setAllChoices(snap.choices);
        setSkippedRounds(snap.skipped);
        setQolHistory(snap.history);
        setRoundSnapshots((p) => p.slice(0, -1));
        setCurrentRound((r) => r - 1);
      }, [currentRound, roundSnapshots]);

      const expenseTotal = household ? getExpenseTotal(adjustedExpenses) : 0;
      const benefitTotal = household ? getCashBenefitTotal(currentBenefits) : 0;

      // Sticky bar color logic
      const stickyBarColor = qualityScore > 50 ? '#0091AD' : qualityScore > 25 ? '#FB923C' : '#EF4444';
      const showStickyBar = screen === "round" && household;
  // ---- END VERBATIM ----

  // Marks the page interactive once React has hydrated (tests wait for it).
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  return (
    <main className={styles.sim} data-sim-root data-screen={screen} data-ready={ready || undefined}>
      {showStickyBar && (
        <PlayBar
          household={household}
          current={currentRound}
          total={rounds.length}
          score={qualityScore}
          income={household.monthlyIncome}
          benefits={benefitTotal}
          expenses={expenseTotal}
          onRestart={restart}
        />
      )}
      {screen !== 'intro' && screen !== 'round' && <ScreenStrip label={STRIP_LABELS[screen]} onRestart={restart} />}

      {screen === 'intro' && <IntroScreen onStart={() => setScreen('select')} />}
      {screen === 'select' && <HouseholdSelect onSelect={selectHousehold} showBuilder={hasCompletedSim} />}
      {screen === 'regionSelect' && household && (
        <RegionSelect
          household={household}
          onSelect={selectRegion}
          caState={caState}
          onCaToggle={setCaState}
          medicalEnrolledPreFreeze={medicalEnrolledPreFreeze}
          onMedicalEnrollment={setMedicalEnrolledPreFreeze}
          calworksApplied={calworksApplied}
          onCalworksApplied={setCalworksApplied}
        />
      )}
      {screen === 'householdIntro' && household && (
        <HouseholdIntro household={household} adjustedExpenses={adjustedExpenses} region={region} onContinue={() => setScreen('round')} />
      )}
      {screen === 'round' && household && currentRound < rounds.length && (
        <PolicyRound
          key={currentRound}
          round={rounds[currentRound]}
          household={household}
          currentBenefits={currentBenefits}
          onChoice={handleRoundChoice}
          onContinue={advanceRound}
          onGoBack={currentRound > 0 ? goBackRound : null}
          current={currentRound}
          total={rounds.length}
          live={{ support: benefitTotal, balance: household.monthlyIncome + benefitTotal - expenseTotal, score: qualityScore }}
        />
      )}
      {screen === 'results' && household && (
        <ResultsScreen
          household={household}
          region={region}
          finalBenefits={currentBenefits}
          finalScore={qualityScore}
          allChoices={allChoices}
          skippedRounds={skippedRounds}
          rounds={rounds}
          qolHistory={qolHistory}
          onRestart={restart}
        />
      )}
    </main>
  )
}
