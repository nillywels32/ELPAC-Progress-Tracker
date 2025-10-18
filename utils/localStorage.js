/**
 * Local storage utilities for persisting student assessment data
 */

const STORAGE_KEY = 'elpac_reclassification_data';
const HISTORY_KEY = 'elpac_assessment_history';

/**
 * Save student assessment data to localStorage
 * @param {object} data - Student assessment data
 */
export const saveAssessmentData = (data) => {
  try {
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Error saving assessment data:', error);
    return false;
  }
};

/**
 * Load student assessment data from localStorage
 * @returns {object|null} Student assessment data or null
 */
export const loadAssessmentData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading assessment data:', error);
    return null;
  }
};

/**
 * Clear all saved assessment data
 */
export const clearAssessmentData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing assessment data:', error);
    return false;
  }
};

/**
 * Save assessment attempt to history
 * @param {object} assessmentData - Assessment data to save
 */
export const saveAssessmentHistory = (assessmentData) => {
  try {
    const history = loadAssessmentHistory();
    const newEntry = {
      ...assessmentData,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    history.push(newEntry);

    // Keep only last 50 entries
    const trimmedHistory = history.slice(-50);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    return true;
  } catch (error) {
    console.error('Error saving assessment history:', error);
    return false;
  }
};

/**
 * Load assessment history from localStorage
 * @returns {array} Array of historical assessment data
 */
export const loadAssessmentHistory = () => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading assessment history:', error);
    return [];
  }
};

/**
 * Get history for a specific assessment type
 * @param {string} assessmentType - Type of assessment (sbac, iReady, etc.)
 * @returns {array} Filtered history
 */
export const getAssessmentTypeHistory = (assessmentType) => {
  const history = loadAssessmentHistory();
  return history.filter(entry => entry[assessmentType]);
};

/**
 * Clear assessment history
 */
export const clearAssessmentHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing assessment history:', error);
    return false;
  }
};

/**
 * Export all data as JSON for backup
 * @returns {object} All saved data
 */
export const exportAllData = () => {
  return {
    currentData: loadAssessmentData(),
    history: loadAssessmentHistory(),
    exportDate: new Date().toISOString()
  };
};

/**
 * Import data from backup
 * @param {object} data - Data to import
 * @returns {boolean} Success status
 */
export const importData = (data) => {
  try {
    if (data.currentData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.currentData));
    }
    if (data.history) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history));
    }
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
