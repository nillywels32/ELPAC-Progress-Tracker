/**
 * Comprehensive Test Suite for Calculation Accuracy
 * Verifies all mathematical operations produce precise, expected results
 */

import {
  calculateElpacOverallScore,
  getElpacLevel,
  calculateElpacPointsNeeded,
  calculateProgress,
  calculatePointsNeeded,
  calculateOverallProgress,
  getSbacLevel,
  meetsRequirement,
  calculatePercentageToGoal
} from '../utils/calculations';

// Test helper
const assertEqual = (actual, expected, testName) => {
  if (actual === expected) {
    console.log(`✅ PASS: ${testName}`);
    return true;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    console.error(`   Expected: ${expected}`);
    console.error(`   Actual: ${actual}`);
    return false;
  }
};

const assertDeepEqual = (actual, expected, testName) => {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    console.log(`✅ PASS: ${testName}`);
    return true;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    console.error(`   Expected: ${expectedStr}`);
    console.error(`   Actual: ${actualStr}`);
    return false;
  }
};

console.log('\n🧮 ELPAC CALCULATION TESTS\n');

// Test 1: ELPAC Overall Score - Perfect average
let result = calculateElpacOverallScore(1600, 1600);
assertEqual(result, 1600, 'ELPAC - Equal scores (1600, 1600) = 1600');

// Test 2: ELPAC Overall Score - Different scores
result = calculateElpacOverallScore(1600, 1550);
assertEqual(result, 1575, 'ELPAC - Different scores (1600, 1550) = 1575');

// Test 3: ELPAC Overall Score - At threshold for Grade 7
result = calculateElpacOverallScore(1576, 1576);
assertEqual(result, 1576, 'ELPAC - At Grade 7 Level 4 threshold (1576, 1576) = 1576');

// Test 4: ELPAC Overall Score - Just below threshold
result = calculateElpacOverallScore(1575, 1575);
assertEqual(result, 1575, 'ELPAC - Just below threshold (1575, 1575) = 1575');

// Test 5: ELPAC Overall Score - One point below threshold
result = calculateElpacOverallScore(1577, 1575);
assertEqual(result, 1576, 'ELPAC - Rounded to threshold (1577, 1575) = 1576');

// Test 6: ELPAC Overall Score - Odd sum (should round)
result = calculateElpacOverallScore(1577, 1576);
assertEqual(result, 1577, 'ELPAC - Odd sum rounds correctly (1577, 1576) = 1577');

// Test 7: ELPAC Overall Score - High scores
result = calculateElpacOverallScore(1850, 1900);
assertEqual(result, 1875, 'ELPAC - High scores (1850, 1900) = 1875');

// Test 8: ELPAC Overall Score - Low scores
result = calculateElpacOverallScore(1150, 1150);
assertEqual(result, 1150, 'ELPAC - Minimum scores (1150, 1150) = 1150');

console.log('\n🎯 ELPAC LEVEL DETERMINATION TESTS\n');

// Test 9: ELPAC Level - Grade 7, Level 1
result = getElpacLevel(1300, 7);
assertEqual(result.level, 1, 'ELPAC - Grade 7, Score 1300 = Level 1');
assertEqual(result.meets, false, 'ELPAC - Level 1 does not meet requirement');

// Test 10: ELPAC Level - Grade 7, Level 2
result = getElpacLevel(1500, 7);
assertEqual(result.level, 2, 'ELPAC - Grade 7, Score 1500 = Level 2');

// Test 11: ELPAC Level - Grade 7, Level 3
result = getElpacLevel(1550, 7);
assertEqual(result.level, 3, 'ELPAC - Grade 7, Score 1550 = Level 3');

// Test 12: ELPAC Level - Grade 7, Level 4 (exactly at threshold)
result = getElpacLevel(1576, 7);
assertEqual(result.level, 4, 'ELPAC - Grade 7, Score 1576 = Level 4');
assertEqual(result.meets, true, 'ELPAC - Level 4 meets requirement');

// Test 13: ELPAC Level - Grade 7, Level 4 (above threshold)
result = getElpacLevel(1700, 7);
assertEqual(result.level, 4, 'ELPAC - Grade 7, Score 1700 = Level 4');

// Test 14: ELPAC Level - Grade 8, Level 4 (at threshold)
result = getElpacLevel(1590, 8);
assertEqual(result.level, 4, 'ELPAC - Grade 8, Score 1590 = Level 4');
assertEqual(result.meets, true, 'ELPAC - Grade 8 Level 4 meets requirement');

// Test 15: ELPAC Level - Grade 8, just below Level 4
result = getElpacLevel(1589, 8);
assertEqual(result.level, 3, 'ELPAC - Grade 8, Score 1589 = Level 3');
assertEqual(result.meets, false, 'ELPAC - Grade 8 Level 3 does not meet');

console.log('\n📊 PROGRESS CALCULATION TESTS\n');

// Test 16: Progress - Exactly at target
result = calculateProgress(562, 562);
assertEqual(result, 100, 'Progress - At target (562/562) = 100%');

// Test 17: Progress - Halfway to target
result = calculateProgress(281, 562);
assertEqual(Math.round(result), 50, 'Progress - Halfway (281/562) ≈ 50%');

// Test 18: Progress - Above target
result = calculateProgress(600, 562);
assertEqual(Math.round(result), 107, 'Progress - Above target (600/562) = 107%');

// Test 19: Progress - Zero current score
result = calculateProgress(0, 562);
assertEqual(result, 0, 'Progress - Zero score (0/562) = 0%');

// Test 20: Progress - Just below target
result = calculateProgress(561, 562);
assertEqual(Math.round(result), 100, 'Progress - Just below (561/562) ≈ 100%');

console.log('\n🎓 SBAC LEVEL TESTS\n');

// Test 21: SBAC - Grade 7, Not Met
result = getSbacLevel(2400, 7);
assertEqual(result.level, 'Standard Not Met', 'SBAC - Grade 7, 2400 = Not Met');
assertEqual(result.meets, false, 'SBAC - Not Met does not meet requirement');

// Test 22: SBAC - Grade 7, Nearly Met (at threshold)
result = getSbacLevel(2479, 7);
assertEqual(result.level, 'Standard Nearly Met', 'SBAC - Grade 7, 2479 = Nearly Met');
assertEqual(result.meets, true, 'SBAC - Nearly Met meets requirement');

// Test 23: SBAC - Grade 7, Met
result = getSbacLevel(2600, 7);
assertEqual(result.level, 'Standard Met', 'SBAC - Grade 7, 2600 = Met');
assertEqual(result.meets, true, 'SBAC - Met meets requirement');

// Test 24: SBAC - Grade 7, Exceeded
result = getSbacLevel(2700, 7);
assertEqual(result.level, 'Standard Exceeded', 'SBAC - Grade 7, 2700 = Exceeded');
assertEqual(result.meets, true, 'SBAC - Exceeded meets requirement');

// Test 25: SBAC - Grade 8, Nearly Met (at threshold)
result = getSbacLevel(2487, 8);
assertEqual(result.level, 'Standard Nearly Met', 'SBAC - Grade 8, 2487 = Nearly Met');
assertEqual(result.meets, true, 'SBAC - Grade 8 Nearly Met meets requirement');

// Test 26: SBAC - Grade 8, just below Nearly Met
result = getSbacLevel(2486, 8);
assertEqual(result.level, 'Standard Not Met', 'SBAC - Grade 8, 2486 = Not Met');
assertEqual(result.meets, false, 'SBAC - Grade 8 Not Met does not meet');

console.log('\n✅ REQUIREMENT CHECKING TESTS\n');

// Test 27: Meets requirement - Exactly at target
result = meetsRequirement(562, 562);
assertEqual(result, true, 'Meets - Exactly at target (562 >= 562)');

// Test 28: Meets requirement - Above target
result = meetsRequirement(570, 562);
assertEqual(result, true, 'Meets - Above target (570 >= 562)');

// Test 29: Meets requirement - Below target
result = meetsRequirement(560, 562);
assertEqual(result, false, 'Does not meet - Below target (560 < 562)');

// Test 30: Meets requirement - One point below
result = meetsRequirement(561, 562);
assertEqual(result, false, 'Does not meet - One point below (561 < 562)');

console.log('\n🎯 OVERALL PROGRESS TESTS\n');

// Test 31: Overall Progress - Both requirements met
result = calculateOverallProgress(true, 100, 1, 100);
assertEqual(result, 100, 'Overall - Both met = 100%');

// Test 32: Overall Progress - Only ELPAC met
result = calculateOverallProgress(true, 100, 0, 50);
assertEqual(result, 75, 'Overall - ELPAC met (50%) + 50% progress (25%) = 75%');

// Test 33: Overall Progress - Neither met
result = calculateOverallProgress(false, 50, 0, 50);
assertEqual(result, 50, 'Overall - ELPAC 50% (25%) + Other 50% (25%) = 50%');

// Test 34: Overall Progress - ELPAC not met, other met
result = calculateOverallProgress(false, 80, 1, 100);
assertEqual(result, 90, 'Overall - ELPAC 80% (40%) + Other met (50%) = 90%');

// Test 35: Overall Progress - ELPAC met, other close
result = calculateOverallProgress(true, 100, 0, 90);
assertEqual(result, 95, 'Overall - ELPAC met (50%) + Other 90% (45%) = 95%');

console.log('\n🔢 POINTS NEEDED TESTS\n');

// Test 36: Points needed - Below target
result = calculatePointsNeeded(550, 562);
assertEqual(result, 12, 'Points needed - 550 to 562 = 12 points');

// Test 37: Points needed - At target
result = calculatePointsNeeded(562, 562);
assertEqual(result, 0, 'Points needed - Already at target = 0 points');

// Test 38: Points needed - Above target
result = calculatePointsNeeded(570, 562);
assertEqual(result, 0, 'Points needed - Above target = 0 points');

// Test 39: ELPAC Points needed - Grade 7
result = calculateElpacPointsNeeded(1550, 7);
assertEqual(result.pointsNeeded, 26, 'ELPAC - Grade 7 needs 26 overall points (1550 → 1576)');
assertEqual(result.totalPointsNeeded, 52, 'ELPAC - Grade 7 needs 52 total points to improve both components');

// Test 40: ELPAC Points needed - Grade 8
result = calculateElpacPointsNeeded(1560, 8);
assertEqual(result.pointsNeeded, 30, 'ELPAC - Grade 8 needs 30 overall points (1560 → 1590)');
assertEqual(result.totalPointsNeeded, 60, 'ELPAC - Grade 8 needs 60 total points');

console.log('\n📈 PERCENTAGE TO GOAL TESTS\n');

// Test 41: Percentage to goal - 50%
result = calculatePercentageToGoal(25, 50);
assertEqual(result, 50, 'Percentage - 25/50 = 50%');

// Test 42: Percentage to goal - 100%
result = calculatePercentageToGoal(562, 562);
assertEqual(result, 100, 'Percentage - 562/562 = 100%');

// Test 43: Percentage to goal - Over 100% (capped)
result = calculatePercentageToGoal(600, 562);
assertEqual(result, 100, 'Percentage - 600/562 capped at 100%');

// Test 44: Percentage to goal - 0%
result = calculatePercentageToGoal(0, 562);
assertEqual(result, 0, 'Percentage - 0/562 = 0%');

console.log('\n🧪 EDGE CASE TESTS\n');

// Test 45: ELPAC - Null values
result = calculateElpacOverallScore(null, 1600);
assertEqual(result, null, 'ELPAC - Null oral score returns null');

// Test 46: ELPAC - Empty string
result = calculateElpacOverallScore('', 1600);
assertEqual(result, null, 'ELPAC - Empty oral score returns null');

// Test 47: ELPAC - Out of range (too low)
result = calculateElpacOverallScore(1000, 1600);
assertEqual(result, null, 'ELPAC - Score below 1150 returns null');

// Test 48: ELPAC - Out of range (too high)
result = calculateElpacOverallScore(2000, 1600);
assertEqual(result, null, 'ELPAC - Score above 1900 returns null');

// Test 49: Progress - Null score
result = calculateProgress(null, 562);
assertEqual(result, 0, 'Progress - Null score returns 0%');

// Test 50: Progress - Null target
result = calculateProgress(550, null);
assertEqual(result, 0, 'Progress - Null target returns 0%');

console.log('\n🎉 INTEGRATION TESTS - REAL SCENARIOS\n');

// Scenario 1: Student ready to reclassify
console.log('\n📋 Scenario 1: Ready to Reclassify');
const elpacScore1 = calculateElpacOverallScore(1600, 1600);
const elpacLevel1 = getElpacLevel(elpacScore1, 7);
const iReadyMeets1 = meetsRequirement(570, 562);
const canReclassify1 = elpacLevel1.meets && iReadyMeets1;
assertEqual(canReclassify1, true, 'Scenario 1 - Student qualifies for reclassification');

// Scenario 2: ELPAC met, no other assessment
console.log('\n📋 Scenario 2: ELPAC Met, Others In Progress');
const elpacScore2 = calculateElpacOverallScore(1580, 1580);
const elpacLevel2 = getElpacLevel(elpacScore2, 7);
const iReadyMeets2 = meetsRequirement(550, 562);
const canReclassify2 = elpacLevel2.meets && iReadyMeets2;
assertEqual(canReclassify2, false, 'Scenario 2 - Needs to meet one more assessment');
assertEqual(elpacLevel2.meets, true, 'Scenario 2 - ELPAC requirement met');

// Scenario 3: Other assessment met, ELPAC not
console.log('\n📋 Scenario 3: Other Met, ELPAC Not Met');
const elpacScore3 = calculateElpacOverallScore(1550, 1550);
const elpacLevel3 = getElpacLevel(elpacScore3, 7);
const iReadyMeets3 = meetsRequirement(570, 562);
const canReclassify3 = elpacLevel3.meets && iReadyMeets3;
assertEqual(canReclassify3, false, 'Scenario 3 - ELPAC is mandatory, cannot qualify without it');
assertEqual(elpacLevel3.meets, false, 'Scenario 3 - ELPAC Level 3 does not meet');

// Scenario 4: Neither requirement met
console.log('\n📋 Scenario 4: Both Requirements Not Met');
const elpacScore4 = calculateElpacOverallScore(1500, 1500);
const elpacLevel4 = getElpacLevel(elpacScore4, 7);
const iReadyMeets4 = meetsRequirement(540, 562);
const canReclassify4 = elpacLevel4.meets && iReadyMeets4;
assertEqual(canReclassify4, false, 'Scenario 4 - Needs both requirements');

// Scenario 5: Multiple assessments met
console.log('\n📋 Scenario 5: ELPAC + Multiple Others Met');
const elpacScore5 = calculateElpacOverallScore(1650, 1650);
const elpacLevel5 = getElpacLevel(elpacScore5, 7);
const iReadyMeets5 = meetsRequirement(570, 562);
const sbacResult5 = getSbacLevel(2500, 7);
const canReclassify5 = elpacLevel5.meets && (iReadyMeets5 || sbacResult5.meets);
assertEqual(canReclassify5, true, 'Scenario 5 - Exceeds requirements (ELPAC + 2 others)');

console.log('\n✅ ALL TESTS COMPLETED!\n');
console.log('Review any ❌ FAIL results above to identify calculation errors.\n');
