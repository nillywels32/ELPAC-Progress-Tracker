import React, { useState, useEffect } from 'react';
import { Target, Award, CheckCircle, XCircle, BookOpen, GraduationCap, MapPin, BarChart3, Save, RefreshCw, Info, HelpCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import utility functions
import {
  calculateElpacOverallScore,
  getElpacLevel,
  calculateElpacPointsNeeded,
  calculateProgress,
  calculateOverallProgress,
  getSbacLevel,
  meetsRequirement,
  getAssessmentData
} from './utils/calculations';

import { saveAssessmentData, loadAssessmentData, saveAssessmentHistory } from './utils/localStorage';

// Import chart components
import ComparisonBarChart from './components/charts/ComparisonBarChart';
import RadialProgressGauge from './components/charts/RadialProgressGauge';
import ElpacBreakdownChart from './components/charts/ElpacBreakdownChart';
import AchievementRadarChart from './components/charts/AchievementRadarChart';
import ProgressTimelineChart from './components/charts/ProgressTimelineChart';

// Import animation components
import AnimatedCard from './components/animations/AnimatedCard';
import { AnimatedProgressBar, AnimatedCircleProgress, BounceIn, SlideDown, ScaleOnChange } from './components/animations/AnimatedProgress';
import { CelebrationEffect, SuccessBadge } from './components/animations/CelebrationEffect';

// Import PDF export
import ExportButtons from './components/PDFExport/ExportButtons';

const RoadToReclassificationEnhanced = () => {
  // State management
  const [selectedGrade, setSelectedGrade] = useState(7);
  const [selectedCycle, setSelectedCycle] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [elpacTestGrade, setElpacTestGrade] = useState(7); // Grade when ELPAC was taken

  // Assessment Scores
  const [sbacScore, setSbacScore] = useState('');
  const [iReadyScore, setIReadyScore] = useState('');

  // ELPAC Scores
  const [elpacOralScore, setElpacOralScore] = useState('');
  const [elpacWrittenScore, setElpacWrittenScore] = useState('');

  // UI State
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  // Get assessment data for current grade
  const assessmentData = getAssessmentData(selectedGrade);

  // Validation helpers
  const isValidElpacScore = (score) => {
    if (!score) return true; // Empty is valid (not yet entered)
    const num = parseInt(score);
    return num >= 1150 && num <= 1900;
  };

  const isValidSbacScore = (score) => {
    if (!score) return true;
    const num = parseInt(score);
    return num >= 2000 && num <= 3000;
  };

  const isValidIReadyScore = (score) => {
    if (!score) return true;
    const num = parseInt(score);
    return num >= 100 && num <= 800;
  };

  // Calculate ELPAC results using the grade when test was taken
  const elpacOverallScore = calculateElpacOverallScore(elpacOralScore, elpacWrittenScore);
  const elpacResult = elpacOverallScore ? {
    ...getElpacLevel(elpacOverallScore, elpacTestGrade),
    overallScore: elpacOverallScore,
    oralScore: parseInt(elpacOralScore),
    writtenScore: parseInt(elpacWrittenScore)
  } : null;

  // Calculate other assessment results
  const sbacResult = sbacScore ? getSbacLevel(sbacScore, selectedGrade) : null;
  const iReadyTarget = assessmentData.iReady[selectedCycle === 1 ? 'cycle1' : 'cycle2'];
  const iReadyMeets = iReadyScore ? meetsRequirement(iReadyScore, iReadyTarget) : false;

  // Calculate reclassification status
  const elpacMeets = elpacResult?.meets || false;
  const otherAssessmentsMet = [sbacResult?.meets, iReadyMeets].filter(Boolean).length;
  const canReclassify = elpacMeets && otherAssessmentsMet > 0;

  // Prepare data for charts
  const assessmentProgressData = [
    elpacResult && {
      name: 'ELPAC',
      shortName: 'ELPAC',
      score: elpacResult.overallScore,
      target: assessmentData.elpac.level4Min,
      meets: elpacResult.meets,
      shortfall: Math.max(0, assessmentData.elpac.level4Min - elpacResult.overallScore)
    },
    sbacScore && {
      name: 'SBAC ELA',
      shortName: 'SBAC',
      score: parseInt(sbacScore),
      target: selectedGrade === 7 ? 2479 : 2487,
      meets: sbacResult?.meets || false,
      shortfall: sbacResult?.meets ? 0 : Math.max(0, (selectedGrade === 7 ? 2479 : 2487) - parseInt(sbacScore))
    },
    iReadyScore && {
      name: 'i-Ready',
      shortName: 'i-Ready',
      score: parseInt(iReadyScore),
      target: iReadyTarget,
      meets: iReadyMeets,
      shortfall: iReadyMeets ? 0 : iReadyTarget - parseInt(iReadyScore)
    }
  ].filter(Boolean);

  // Calculate overall progress
  const bestOtherProgress = assessmentProgressData
    .filter(a => a.name !== 'ELPAC')
    .reduce((max, a) => Math.max(max, calculateProgress(a.score, a.target)), 0);

  const elpacProgress = elpacResult ? calculateProgress(elpacResult.overallScore, assessmentData.elpac.level4Min) : 0;
  const overallProgress = calculateOverallProgress(elpacMeets, elpacProgress, otherAssessmentsMet, bestOtherProgress);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled) {
      const dataToSave = {
        selectedGrade,
        selectedCycle,
        studentName,
        elpacTestGrade,
        sbacScore,
        iReadyScore,
        elpacOralScore,
        elpacWrittenScore
      };

      const timer = setTimeout(() => {
        saveAssessmentData(dataToSave);
        setLastSaved(new Date());
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [autoSaveEnabled, selectedGrade, selectedCycle, studentName, elpacTestGrade, sbacScore, iReadyScore, elpacOralScore, elpacWrittenScore]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadAssessmentData();
    if (savedData) {
      setSelectedGrade(savedData.selectedGrade || 7);
      setSelectedCycle(savedData.selectedCycle || 1);
      setStudentName(savedData.studentName || '');
      setElpacTestGrade(savedData.elpacTestGrade || 7);
      setSbacScore(savedData.sbacScore || '');
      setIReadyScore(savedData.iReadyScore || '');
      setElpacOralScore(savedData.elpacOralScore || '');
      setElpacWrittenScore(savedData.elpacWrittenScore || '');
    }
  }, []);

  // Show celebration when student becomes eligible
  useEffect(() => {
    if (canReclassify && !showCelebration) {
      setShowCelebration(true);
    }
  }, [canReclassify]);

  // Prepare student data for PDF export
  const studentDataForExport = {
    sbacScore,
    sbacResult,
    iReadyScore,
    cycle: selectedCycle,
    elpacResult,
    canReclassify,
    elpacMeets,
    otherAssessmentsMet
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      {/* Celebration Effect */}
      <CelebrationEffect show={showCelebration} onComplete={() => setShowCelebration(false)} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <SlideDown>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MapPin className="text-blue-600" size={40} />
              <h1 className="text-4xl font-bold text-gray-800">Road to Reclassification</h1>
            </div>
            <p className="text-gray-600 text-lg mb-6">
              Track your progress across all three assessment pathways
            </p>

            {/* Welcome Instructions Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-md"
            >
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div className="text-left">
                  <h2 className="text-xl font-bold text-blue-900 mb-3">How to Use This Tracker</h2>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-600">1.</span>
                      <span><strong>Enter your name</strong> and select your grade level (7th or 8th)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-600">2.</span>
                      <span><strong>Enter your test scores</strong> as you receive them from your teacher</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-600">3.</span>
                      <span><strong>Watch your progress</strong> update automatically with charts and graphs</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-blue-600">4.</span>
                      <span><strong>Your data saves automatically</strong> - come back anytime to update scores!</span>
                    </li>
                  </ol>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-900 flex items-center gap-2">
                      <AlertCircle size={18} className="flex-shrink-0" />
                      <span><strong>Remember:</strong> You need <strong>BOTH</strong> ELPAC Level 4 (required) + ONE other assessment to qualify for reclassification!</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Student Name Input - Enhanced */}
            <div className="max-w-md mx-auto mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2 text-left">
                Your Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-medium"
                placeholder="Enter your full name here"
              />
              {studentName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1"
                >
                  <CheckCircle size={16} />
                  Welcome, {studentName}! Your progress is being saved.
                </motion.p>
              )}
            </div>

            {/* Grade Selection */}
            <div className="flex justify-center gap-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedGrade(7)}
                className={`px-6 py-3 rounded-lg transition-all ${
                  selectedGrade === 7
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                7th Grade
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedGrade(8)}
                className={`px-6 py-3 rounded-lg transition-all ${
                  selectedGrade === 8
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                8th Grade
              </motion.button>
            </div>

            {/* Auto-save indicator */}
            {lastSaved && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500"
              >
                <Save size={14} className="inline mr-1" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </motion.p>
            )}
          </div>
        </SlideDown>

        {/* Progress Banner */}
        <AnimatedCard delay={0.1}>
          <div className={`mb-8 p-6 rounded-xl text-center relative overflow-hidden ${
            canReclassify
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300'
              : 'bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300'
          }`}>
            <div className="relative z-10">
              <h2 className={`text-3xl font-bold mb-2 ${canReclassify ? 'text-green-800' : 'text-orange-800'}`}>
                {canReclassify
                  ? `🎉 Ready to Reclassify!`
                  : '🎯 Path to Reclassification'
                }
              </h2>
              <p className={`text-lg ${canReclassify ? 'text-green-700' : 'text-orange-700'}`}>
                {canReclassify
                  ? `You've met both requirements: ELPAC Level 4 AND ${otherAssessmentsMet} other assessment${otherAssessmentsMet > 1 ? 's' : ''}!`
                  : 'You need ELPAC Level 4 PLUS at least one other qualifying assessment.'
                }
              </p>
              <div className={`mt-3 p-3 rounded-lg ${canReclassify ? 'bg-green-200' : 'bg-orange-200'}`}>
                <p className={`font-semibold ${canReclassify ? 'text-green-800' : 'text-orange-800'}`}>
                  📋 Requirements Checklist:
                </p>
                <div className="grid md:grid-cols-2 gap-2 mt-2 text-sm">
                  <div className={`flex items-center gap-2 justify-center ${elpacMeets ? 'text-green-700' : 'text-orange-700'}`}>
                    {elpacMeets ? '✅' : '🔲'} ELPAC Level 4 (REQUIRED)
                  </div>
                  <div className={`flex items-center gap-2 justify-center ${otherAssessmentsMet > 0 ? 'text-green-700' : 'text-orange-700'}`}>
                    {otherAssessmentsMet > 0 ? '✅' : '🔲'} At least 1 other assessment
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="mt-6">
                <div className={`border-2 rounded-xl p-6 ${
                  canReclassify
                    ? 'bg-green-50 border-green-400'
                    : 'bg-white border-gray-300'
                }`}>
                  <div className="text-center mb-4">
                    <h3 className={`text-2xl font-bold mb-2 ${
                      canReclassify ? 'text-green-800' : 'text-gray-800'
                    }`}>
                      {canReclassify ? '✅ YOU QUALIFY!' : '📊 YOUR STATUS'}
                    </h3>
                    <p className={`text-xl font-semibold ${
                      canReclassify ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {canReclassify ? 'Ready for Reclassification' : 'Not Yet Qualifying'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* ELPAC Requirement */}
                    <div className={`p-4 rounded-lg border-2 ${
                      elpacMeets
                        ? 'bg-green-100 border-green-400'
                        : 'bg-orange-50 border-orange-300'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {elpacMeets ? '✅' : '❌'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1">
                            ELPAC Level 4 (Required)
                          </h4>
                          {elpacResult ? (
                            <>
                              <p className="text-sm text-gray-700">
                                You: <span className="font-semibold">Level {elpacResult.level}</span> ({elpacResult.overallScore})
                                {' | '}Need: Level 4 ({elpacTestGrade === 6 ? '1567+' : elpacTestGrade === 7 ? '1576+' : '1590+'})
                              </p>
                              {!elpacMeets && (
                                <p className="text-sm font-semibold text-orange-700 mt-1">
                                  Gap: {(elpacTestGrade === 6 ? 1567 : elpacTestGrade === 7 ? 1576 : 1590) - elpacResult.overallScore} points needed
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-600">Enter your ELPAC scores above</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Other Assessments */}
                    <div className={`p-4 rounded-lg border-2 ${
                      otherAssessmentsMet > 0
                        ? 'bg-green-100 border-green-400'
                        : 'bg-orange-50 border-orange-300'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {otherAssessmentsMet > 0 ? '✅' : '❌'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-2">
                            Pass ONE of These Assessments
                          </h4>
                          <div className="space-y-2 text-sm">
                            {/* SBAC */}
                            {sbacScore && (
                              <div className={`flex items-center gap-2 ${sbacResult?.meets ? 'text-green-700' : 'text-gray-700'}`}>
                                {sbacResult?.meets ? '✅' : '⭕'}
                                <span>SBAC: {sbacScore}/{selectedGrade === 7 ? '2479' : '2487'}</span>
                                {!sbacResult?.meets && sbacScore && (
                                  <span className="text-orange-600 font-semibold">
                                    ({(selectedGrade === 7 ? 2479 : 2487) - parseInt(sbacScore)} away)
                                  </span>
                                )}
                              </div>
                            )}
                            {/* i-Ready */}
                            {iReadyScore && (
                              <div className={`flex items-center gap-2 ${iReadyMeets ? 'text-green-700' : 'text-gray-700'}`}>
                                {iReadyMeets ? '✅' : '⭕'}
                                <span>i-Ready: {iReadyScore}/{iReadyTarget}</span>
                                {!iReadyMeets && iReadyScore && (
                                  <span className="text-orange-600 font-semibold">
                                    ({iReadyTarget - parseInt(iReadyScore)} away) 🎯
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Show message if no other assessments entered */}
                            {!sbacScore && !iReadyScore && (
                              <p className="text-gray-600 italic">Enter at least one optional assessment above</p>
                            )}
                            {/* Show count of passed assessments */}
                            {otherAssessmentsMet > 0 && (
                              <p className="font-semibold text-green-700 mt-2">
                                ✨ {otherAssessmentsMet} assessment{otherAssessmentsMet > 1 ? 's' : ''} passed!
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Next Steps */}
                    {!canReclassify && (
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                          <Target size={20} />
                          Your Next Goal:
                        </h4>
                        <p className="text-sm text-blue-700">
                          {!elpacMeets && elpacResult ? (
                            <>Focus on reaching ELPAC Level 4! You need {(elpacTestGrade === 6 ? 1567 : elpacTestGrade === 7 ? 1576 : 1590) - elpacResult.overallScore} more points.</>
                          ) : !elpacMeets ? (
                            <>Take the ELPAC assessment and aim for Level 4!</>
                          ) : otherAssessmentsMet === 0 ? (
                            <>Great job on ELPAC! Now pass just ONE other assessment to qualify.</>
                          ) : null}
                        </p>
                      </div>
                    )}

                    {/* Success Message */}
                    {canReclassify && (
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-lg p-4 text-center">
                        <p className="text-lg font-bold text-green-800 mb-2">
                          🎉 Congratulations!
                        </p>
                        <p className="text-sm text-green-700">
                          You've met both requirements! Talk to your counselor about reclassification.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Assessment Input Cards */}
        <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
          {/* ELPAC Card */}
          <AnimatedCard delay={0.2} className="md:col-span-2 lg:col-span-4">
            <div className={`bg-white rounded-xl p-6 shadow-lg border-3 ${
              elpacResult?.meets ? 'border-green-400' : 'border-indigo-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${elpacResult?.meets ? 'bg-green-100' : 'bg-indigo-100'}`}>
                  <GraduationCap className={elpacResult?.meets ? 'text-green-600' : 'text-indigo-600'} size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">🌟 ELPAC Assessment (MANDATORY)</h3>
                  <p className="text-gray-600">English Language Proficiency Assessment for California</p>
                  <p className="text-sm font-semibold text-red-600 mt-1">⚠️ Level 4 Required for ALL Students</p>
                </div>
                {elpacResult?.meets && (
                  <BounceIn delay={0.3}>
                    <CheckCircle className="text-green-600" size={32} />
                  </BounceIn>
                )}
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-200">
                <p className="font-semibold text-indigo-800 text-lg">Required Level: Level 4 ONLY</p>
                <p className="text-sm text-indigo-700 mt-1">
                  Minimum Overall Score: {elpacTestGrade === 6 ? '1567' : elpacTestGrade === 7 ? '1576' : '1590'}
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  Overall Score = (Oral Language × 50%) + (Written Language × 50%)
                </p>
              </div>

              {/* ELPAC Test Grade Selector */}
              <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Info className="text-yellow-600" size={18} />
                  What grade were you in when you took the ELPAC test?
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Important: Select the grade you were in when you took the test, not your current grade. This affects how your score is evaluated.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setElpacTestGrade(6)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                      elpacTestGrade === 6
                        ? 'bg-indigo-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    6th Grade
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setElpacTestGrade(7)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                      elpacTestGrade === 7
                        ? 'bg-indigo-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    7th Grade
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setElpacTestGrade(8)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                      elpacTestGrade === 8
                        ? 'bg-indigo-500 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-300'
                    }`}
                  >
                    8th Grade
                  </motion.button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    🗣️ Oral Language Score
                    <div className="group relative">
                      <HelpCircle size={16} className="text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg -top-2 left-6">
                        This is your combined Listening + Speaking score from your ELPAC test results
                      </div>
                    </div>
                  </label>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Info size={12} />
                    Valid range: 1150-1900
                  </p>
                  <input
                    type="number"
                    value={elpacOralScore}
                    onChange={(e) => setElpacOralScore(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      elpacOralScore && !isValidElpacScore(elpacOralScore)
                        ? 'border-red-400 bg-red-50'
                        : elpacOralScore
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="e.g., 1550"
                    min="1150"
                    max="1900"
                  />
                  {elpacOralScore && !isValidElpacScore(elpacOralScore) && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-600 mt-1 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      Score must be between 1150 and 1900
                    </motion.p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    📝 Written Language Score
                    <div className="group relative">
                      <HelpCircle size={16} className="text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg -top-2 left-6">
                        This is your combined Reading + Writing score from your ELPAC test results
                      </div>
                    </div>
                  </label>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Info size={12} />
                    Valid range: 1150-1900
                  </p>
                  <input
                    type="number"
                    value={elpacWrittenScore}
                    onChange={(e) => setElpacWrittenScore(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      elpacWrittenScore && !isValidElpacScore(elpacWrittenScore)
                        ? 'border-red-400 bg-red-50'
                        : elpacWrittenScore
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="e.g., 1600"
                    min="1150"
                    max="1900"
                  />
                  {elpacWrittenScore && !isValidElpacScore(elpacWrittenScore) && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-600 mt-1 flex items-center gap-1"
                    >
                      <AlertCircle size={12} />
                      Score must be between 1150 and 1900
                    </motion.p>
                  )}
                </div>
              </div>

              {elpacResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 ${
                    elpacResult.meets ? 'bg-green-100 text-green-800 border-green-300' : 'bg-orange-100 text-orange-800 border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {elpacResult.meets ? (
                      <CheckCircle className="text-green-600" size={24} />
                    ) : (
                      <XCircle className="text-orange-600" size={24} />
                    )}
                    <p className="font-bold text-lg">Overall Level: {elpacResult.level}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2 text-sm">
                    <div>
                      <p className="font-medium">Overall Score: <span className="font-bold">{elpacResult.overallScore}</span></p>
                      <p className="text-xs opacity-75">Target: {elpacTestGrade === 6 ? '1567' : elpacTestGrade === 7 ? '1576' : '1590'} for Level 4</p>
                    </div>
                    <div>
                      <p>Oral: {elpacResult.oralScore} | Written: {elpacResult.writtenScore}</p>
                      <p className="text-xs opacity-75">50% + 50% = Overall Score</p>
                    </div>
                  </div>
                  <SuccessBadge show={elpacResult.meets} />
                  {!elpacResult.meets && (
                    <p className="font-semibold mt-2">
                      📚 You need {(elpacTestGrade === 6 ? 1567 : elpacTestGrade === 7 ? 1576 : 1590) - elpacResult.overallScore} more overall points to reach Level 4
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </AnimatedCard>

          {/* Optional Assessments Section Header */}
          <div className="col-span-full">
            <h4 className="text-xl font-bold text-gray-700 text-center mb-4">Additional Requirement: Choose ONE Assessment</h4>
            <p className="text-gray-600 text-center mb-6">
              After achieving ELPAC Level 4, you must ALSO meet the requirement for at least ONE of these two assessments:
            </p>
          </div>
        </div>

        {/* Optional Assessment Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* SBAC Card */}
          <AnimatedCard delay={0.3}>
            <div className={`bg-white rounded-xl p-6 shadow-lg border-3 h-full ${
              sbacResult?.meets ? 'border-green-400' : 'border-blue-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${sbacResult?.meets ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <BookOpen className={sbacResult?.meets ? 'text-green-600' : 'text-blue-600'} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">Option 1: SBAC ELA</h3>
                  <p className="text-sm text-gray-600">Smarter Balanced Assessment</p>
                </div>
                {sbacResult?.meets && (
                  <BounceIn>
                    <CheckCircle className="text-green-600" size={28} />
                  </BounceIn>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-blue-800">Required Level:</p>
                <p className="text-xl font-bold text-blue-600">Nearly Met or Above</p>
                <p className="text-sm text-blue-700">Minimum Score: {selectedGrade === 7 ? '2479' : '2487'}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  Your SBAC ELA Score
                  <div className="group relative">
                    <HelpCircle size={16} className="text-gray-400 cursor-help" />
                    <div className="hidden group-hover:block absolute z-10 w-56 p-2 bg-gray-800 text-white text-xs rounded shadow-lg -top-2 left-6">
                      This is your total score from the SBAC English Language Arts test. Ask your teacher if you don't have this yet!
                    </div>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Info size={12} />
                  Typical range: 2000-3000
                </p>
                <input
                  type="number"
                  value={sbacScore}
                  onChange={(e) => setSbacScore(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    sbacScore && !isValidSbacScore(sbacScore)
                      ? 'border-red-400 bg-red-50'
                      : sbacScore
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2500"
                />
                {sbacScore && !isValidSbacScore(sbacScore) && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-600 mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    Please check your score - typical range is 2000-3000
                  </motion.p>
                )}
              </div>

              {sbacResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg ${
                    sbacResult.meets ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  <p className="font-semibold">Level: {sbacResult.level}</p>
                  <SuccessBadge show={sbacResult.meets} />
                </motion.div>
              )}
            </div>
          </AnimatedCard>

          {/* i-Ready Card */}
          <AnimatedCard delay={0.4}>
            <div className={`bg-white rounded-xl p-6 shadow-lg border-3 h-full ${
              iReadyMeets ? 'border-green-400' : 'border-purple-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${iReadyMeets ? 'bg-green-100' : 'bg-purple-100'}`}>
                  <Target className={iReadyMeets ? 'text-green-600' : 'text-purple-600'} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">Option 2: i-Ready Reading</h3>
                  <p className="text-sm text-gray-600">Diagnostic Assessment</p>
                </div>
                {iReadyMeets && (
                  <BounceIn>
                    <CheckCircle className="text-green-600" size={28} />
                  </BounceIn>
                )}
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedCycle(1)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                    selectedCycle === 1 ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Cycle 1
                </button>
                <button
                  onClick={() => setSelectedCycle(2)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                    selectedCycle === 2 ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Cycle 2
                </button>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-purple-800">Required Score:</p>
                <p className="text-2xl font-bold text-purple-600">{iReadyTarget}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  Your i-Ready Reading Score
                  <div className="group relative">
                    <HelpCircle size={16} className="text-gray-400 cursor-help" />
                    <div className="hidden group-hover:block absolute z-10 w-56 p-2 bg-gray-800 text-white text-xs rounded shadow-lg -top-2 left-6">
                      This is your overall scale score from the i-Ready Reading diagnostic test
                    </div>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Info size={12} />
                  Typical range: 100-800
                </p>
                <input
                  type="number"
                  value={iReadyScore}
                  onChange={(e) => setIReadyScore(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors ${
                    iReadyScore && !isValidIReadyScore(iReadyScore)
                      ? 'border-red-400 bg-red-50'
                      : iReadyScore
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., 570"
                />
                {iReadyScore && !isValidIReadyScore(iReadyScore) && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-600 mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={12} />
                    Please check your score - typical range is 100-800
                  </motion.p>
                )}
              </div>

              {iReadyScore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg ${
                    iReadyMeets ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  <p className="font-semibold text-sm">Score: {iReadyScore} | Target: {iReadyTarget}</p>
                  <SuccessBadge show={iReadyMeets} />
                </motion.div>
              )}
            </div>
          </AnimatedCard>
        </div>

        {/* Charts Section */}
        {assessmentProgressData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-8 mb-8"
          >
            {/* Progress Comparison Chart */}
            <div id="comparison-chart">
              <ComparisonBarChart assessmentData={assessmentProgressData} grade={selectedGrade} />
            </div>
          </motion.div>
        )}

        {/* PDF Export Section */}
        {assessmentProgressData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <ExportButtons
              studentData={studentDataForExport}
              studentName={studentName || 'Student'}
              grade={selectedGrade}
            />
          </motion.div>
        )}

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mt-8"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award size={24} />
            Your Roadmap to Success
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">📚 Study Tips:</h4>
              <ul className="space-y-1 opacity-90">
                <li>• Work with your ELL teacher</li>
                <li>• Complete i-Ready lessons daily</li>
                <li>• Practice reading 20+ minutes/day</li>
                <li>• Ask questions in class</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎯 Assessment Strategy:</h4>
              <ul className="space-y-1 opacity-90">
                <li>• ELPAC Level 4 is your #1 priority</li>
                <li>• After ELPAC, focus on your strongest area</li>
                <li>• Take practice tests when available</li>
                <li>• Review mistakes to improve</li>
                <li>• Stay positive and persistent</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">✅ Next Steps:</h4>
              <ul className="space-y-1 opacity-90">
                <li>• Print your progress report</li>
                <li>• Share with your family</li>
                <li>• Meet with your counselor</li>
                <li>• Celebrate your achievements!</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoadToReclassificationEnhanced;
