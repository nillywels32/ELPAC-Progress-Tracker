/**
 * Precise calculation utilities for ELPAC reclassification tracking
 * All calculations maintain accuracy to avoid floating-point errors
 */

/**
 * Calculate ELPAC overall score from oral and written components
 * Formula: (Oral × 0.5) + (Written × 0.5)
 * @param {number} oralScore - Oral language score (1150-1900)
 * @param {number} writtenScore - Written language score (1150-1900)
 * @returns {number} Overall score rounded to nearest integer
 */
export const calculateElpacOverallScore = (oralScore, writtenScore) => {
  if (!oralScore || !writtenScore) return null;

  const oral = parseFloat(oralScore);
  const written = parseFloat(writtenScore);

  // Validate ranges
  if (oral < 1150 || oral > 1900 || written < 1150 || written > 1900) {
    return null;
  }

  // Use precise calculation: (a + b) / 2 is more accurate than a*0.5 + b*0.5
  return Math.round((oral + written) / 2);
};

/**
 * Determine ELPAC level based on overall score and grade
 * @param {number} overallScore - Overall ELPAC score
 * @param {number} grade - Student grade (7 or 8)
 * @returns {object} Level information { level, meets, range }
 */
export const getElpacLevel = (overallScore, grade) => {
  if (!overallScore || ![7, 8].includes(grade)) return null;

  const levels = {
    7: {
      1: { min: 1150, max: 1480, meets: false },
      2: { min: 1481, max: 1526, meets: false },
      3: { min: 1527, max: 1575, meets: false },
      4: { min: 1576, max: 1900, meets: true }
    },
    8: {
      1: { min: 1150, max: 1485, meets: false },
      2: { min: 1486, max: 1533, meets: false },
      3: { min: 1534, max: 1589, meets: false },
      4: { min: 1590, max: 1900, meets: true }
    }
  };

  const gradeLevels = levels[grade];

  for (const [level, range] of Object.entries(gradeLevels)) {
    if (overallScore >= range.min && overallScore <= range.max) {
      return {
        level: parseInt(level),
        meets: range.meets,
        range: range,
        minForLevel4: levels[grade][4].min
      };
    }
  }

  return null;
};

/**
 * Calculate points needed to reach ELPAC Level 4
 * @param {number} currentScore - Current overall ELPAC score
 * @param {number} grade - Student grade (7 or 8)
 * @returns {object} Points needed breakdown
 */
export const calculateElpacPointsNeeded = (currentScore, grade) => {
  const targetScore = grade === 7 ? 1576 : 1590;
  const pointsNeeded = Math.max(0, targetScore - currentScore);

  // Calculate different improvement strategies
  return {
    pointsNeeded,
    totalPointsNeeded: pointsNeeded * 2, // Since overall is average of 2 components
    strategies: {
      balanced: Math.ceil(pointsNeeded), // Improve both equally
      focused: pointsNeeded * 2 // Focus on one component only
    }
  };
};

/**
 * Calculate assessment progress percentage with precision
 * Progress is based on: how far you've gotten from 0 to the target
 * If you meet or exceed target, progress is 100%
 * @param {number} score - Current score
 * @param {number} target - Target score
 * @param {number} max - Maximum possible score
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgress = (score, target, max = null) => {
  if (!score || !target) return 0;

  const currentScore = parseFloat(score);
  const targetScore = parseFloat(target);

  if (currentScore <= 0 || targetScore <= 0) return 0;

  // If already met or exceeded target, return 100%
  if (currentScore >= targetScore) return 100;

  // Calculate progress from 0 to target
  // This gives actual progress toward meeting the requirement
  const progress = (currentScore / targetScore) * 100;

  // Return progress capped at 100%
  return Math.min(Math.max(progress, 0), 100);
};

/**
 * Calculate points needed to reach target
 * @param {number} score - Current score
 * @param {number} target - Target score
 * @returns {number} Points needed (0 if already met)
 */
export const calculatePointsNeeded = (score, target) => {
  if (!score || !target) return target;

  const currentScore = parseFloat(score);
  const targetScore = parseFloat(target);

  return Math.max(0, targetScore - currentScore);
};

/**
 * Calculate overall reclassification progress
 * Accounts for dual requirement: ELPAC Level 4 + 1 other assessment
 * Progress is ONLY meaningful when requirements are actually met
 * @param {boolean} elpacMeets - Whether ELPAC Level 4 is met
 * @param {number} elpacProgress - ELPAC progress percentage
 * @param {number} otherAssessmentsMet - Number of other assessments met
 * @param {number} bestOtherProgress - Best progress among other assessments
 * @returns {number} Overall progress percentage (0-100)
 */
export const calculateOverallProgress = (
  elpacMeets,
  elpacProgress,
  otherAssessmentsMet,
  bestOtherProgress
) => {
  // If both requirements are met, return 100%
  if (elpacMeets && otherAssessmentsMet > 0) {
    return 100;
  }

  // ELPAC counts as 50% ONLY if Level 4 is achieved
  // Other assessment counts as 50% ONLY if at least one is met
  const elpacContribution = elpacMeets ? 50 : 0;
  const otherContribution = otherAssessmentsMet > 0 ? 50 : 0;

  return elpacContribution + otherContribution;
};

/**
 * Get SBAC level based on score and grade
 * @param {number} score - SBAC score
 * @param {number} grade - Student grade (7 or 8)
 * @returns {object} Level information { level, meets, range }
 */
export const getSbacLevel = (score, grade) => {
  if (!score || ![7, 8].includes(grade)) return null;

  const levels = {
    7: {
      'Standard Not Met': { min: 2260, max: 2478, meets: false },
      'Standard Nearly Met': { min: 2479, max: 2551, meets: true },
      'Standard Met': { min: 2552, max: 2648, meets: true },
      'Standard Exceeded': { min: 2649, max: 2810, meets: true }
    },
    8: {
      'Standard Not Met': { min: 2290, max: 2486, meets: false },
      'Standard Nearly Met': { min: 2487, max: 2566, meets: true },
      'Standard Met': { min: 2567, max: 2667, meets: true },
      'Standard Exceeded': { min: 2668, max: 2850, meets: true }
    }
  };

  const numScore = parseFloat(score);
  const gradeLevels = levels[grade];

  for (const [level, data] of Object.entries(gradeLevels)) {
    if (numScore >= data.min && numScore <= data.max) {
      return { level, meets: data.meets, range: data };
    }
  }

  return null;
};

/**
 * Check if a score meets the requirement
 * @param {number} score - Current score
 * @param {number} target - Target score
 * @returns {boolean} Whether requirement is met
 */
export const meetsRequirement = (score, target) => {
  if (!score || !target) return false;
  return parseFloat(score) >= parseFloat(target);
};

/**
 * Get assessment data for a specific grade
 * @param {number} grade - Student grade (7 or 8)
 * @returns {object} Assessment requirements
 */
export const getAssessmentData = (grade) => {
  const data = {
    7: {
      iReady: { cycle1: 562, cycle2: 567 },
      edciteA: 40,
      edciteB: 38,
      sbac: { nearlyMet: 2479, met: 2552, exceeded: 2649, max: 2810 },
      elpac: {
        level4Min: 1576,
        levels: {
          1: { min: 1150, max: 1480 },
          2: { min: 1481, max: 1526 },
          3: { min: 1527, max: 1575 },
          4: { min: 1576, max: 1900 }
        }
      }
    },
    8: {
      iReady: { cycle1: 567, cycle2: 567 },
      edciteA: 41,
      edciteB: 42,
      sbac: { nearlyMet: 2487, met: 2567, exceeded: 2668, max: 2850 },
      elpac: {
        level4Min: 1590,
        levels: {
          1: { min: 1150, max: 1485 },
          2: { min: 1486, max: 1533 },
          3: { min: 1534, max: 1589 },
          4: { min: 1590, max: 1900 }
        }
      }
    }
  };

  return data[grade] || data[7];
};

/**
 * Calculate percentage toward goal with visual capping
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @returns {number} Percentage (0-100 for display)
 */
export const calculatePercentageToGoal = (current, target) => {
  if (!current || !target || target === 0) return 0;

  const percentage = (parseFloat(current) / parseFloat(target)) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};

/**
 * Validate score is within valid range
 * @param {number} score - Score to validate
 * @param {number} min - Minimum valid score
 * @param {number} max - Maximum valid score
 * @returns {boolean} Whether score is valid
 */
export const isValidScore = (score, min, max) => {
  if (!score) return true; // Empty is valid (not entered)
  const numScore = parseFloat(score);
  return !isNaN(numScore) && numScore >= min && numScore <= max;
};
