const QUALITY_INCREASE_THRESHOLD = 70;
const HIT_BONUS_RATE = 0.08;
const AWARD_BONUS_RATE = 0.12;
const QUALITY_BONUS_RATE = 0.04;
const FLOP_PENALTY_RATE = 0.06;
const MAX_SINGLE_UPDATE_INCREASE_RATE = 0.25;
const MAX_SINGLE_UPDATE_DECREASE_RATE = 0.2;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

import { addTalentHistory } from "../simulation/helpers/historyHelper.js";

export const calculateSalaryProgression = ({
  currentSalary,
  scriptQuality,
  wasHit = false,
  wasFlop = false,
  awardsWon = 0,
}) => {
  const salary = Number(currentSalary || 0);

  if (salary <= 0) {
    return 0;
  }

  const qualityBonusRate =
    scriptQuality >= QUALITY_INCREASE_THRESHOLD
      ? ((scriptQuality - QUALITY_INCREASE_THRESHOLD) / 30) * QUALITY_BONUS_RATE
      : 0;

  const increaseRate = clamp(
    (wasHit ? HIT_BONUS_RATE : 0) +
      Number(awardsWon || 0) * AWARD_BONUS_RATE +
      qualityBonusRate,
    0,
    MAX_SINGLE_UPDATE_INCREASE_RATE
  );

  const decreaseRate = clamp(
    wasFlop ? FLOP_PENALTY_RATE : 0,
    0,
    MAX_SINGLE_UPDATE_DECREASE_RATE
  );

  const nextSalary = Math.round(salary * (1 + increaseRate - decreaseRate));

  return Math.max(0, nextSalary);
};

export const applyWriterSalaryProgression = ({
  gameState,
  writer,
  script,
  currentWeek,
  wasHit = false,
  wasFlop = false,
  awardsWon = 0,
}) => {
  const previousSalary = Number(writer.salary || 0);

  const nextSalary = calculateSalaryProgression({
    currentSalary: previousSalary,
    scriptQuality: Number(script.quality || 0),
    wasHit,
    wasFlop,
    awardsWon,
  });

  if (nextSalary === previousSalary) {
    return {
      previousSalary,
      nextSalary,
      changed: false,
    };
  }

  writer.salary = nextSalary;
  if (gameState) {
    addTalentHistory(gameState, writer.id, "SALARY", {
      week: currentWeek,
      salary: nextSalary,
      reason: reasons.join(" + ") || "Career Adjustment",
    });
  } else {
    writer.salaryHistory = writer.salaryHistory || [];
    writer.salaryHistory.push({
      week: currentWeek,
      salary: nextSalary,
      reason: reasons.join(" + ") || "Career Adjustment",
    });
    const MAX_HISTORY_RECORDS = 20;
      if (writer.salaryHistory.length > MAX_HISTORY_RECORDS) {
        writer.salaryHistory.shift();
      }
    }
  

  return {
    previousSalary,
    nextSalary,
    changed: true,
  };
};
