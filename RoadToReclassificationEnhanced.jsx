import React, { useState, useEffect } from 'react';
import { Target, Award, CheckCircle, XCircle, BookOpen, GraduationCap, MapPin, FileText, BarChart3, Save, RefreshCw } from 'lucide-react';
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

  // Assessment Scores
  const [sbacScore, setSbacScore] = useState('');
  const [iReadyScore, setIReadyScore] = useState('');
  const [edciteAScore, setEdciteAScore] = useState('');
  const [edciteBScore, setEdciteBScore] = useState('');

  // ELPAC Scores
  const [elpacOralScore, setElpacOralScore] = useState('');
  const [elpacWrittenScore, setElpacWrittenScore] = useState('');

  // UI State
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  // Get assessment data for current grade
  const assessmentData = getAssessmentData(selectedGrade);

  // Calculate ELPAC results
  const elpacOverallScore = calculateElpacOverallScore(elpacOralScore, elpacWrittenScore);
  const elpacResult = elpacOverallScore ? {
    ...getElpacLevel(elpacOverallScore, selectedGrade),
    overallScore: elpacOverallScore,
    oralScore: parseInt(elpacOralScore),
    writtenScore: parseInt(elpacWrittenScore)
  } : null;

  // Calculate other assessment results
  const sbacResult = sbacScore ? getSbacLevel(sbacScore, selectedGrade) : null;
  const iReadyTarget = assessmentData.iReady[selectedCycle === 1 ? 'cycle1' : 'cycle2'];
  const iReadyMeets = iReadyScore ? meetsRequirement(iReadyScore, iReadyTarget) : false;
  const edciteAMeets = edciteAScore ? meetsRequirement(edciteAScore, assessmentData.edciteA) : false;
  const edciteBMeets = edciteBScore ? meetsRequirement(edciteBScore, assessmentData.edciteB) : false;

  // Calculate reclassification status
  const elpacMeets = elpacResult?.meets || false;
  const otherAssessmentsMet = [sbacResult?.meets, iReadyMeets, edciteAMeets, edciteBMeets].filter(Boolean).length;
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
    },
    edciteAScore && {
      name: 'Edcite A',
      shortName: 'Edcite A',
      score: parseInt(edciteAScore),
      target: assessmentData.edciteA,
      meets: edciteAMeets,
      shortfall: edciteAMeets ? 0 : assessmentData.edciteA - parseInt(edciteAScore)
    },
    edciteBScore && {
      name: 'Edcite B',
      shortName: 'Edcite B',
      score: parseInt(edciteBScore),
      target: assessmentData.edciteB,
      meets: edciteBMeets,
      shortfall: edciteBMeets ? 0 : assessmentData.edciteB - parseInt(edciteBScore)
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
        sbacScore,
        iReadyScore,
        edciteAScore,
        edciteBScore,
        elpacOralScore,
        elpacWrittenScore
      };

      const timer = setTimeout(() => {
        saveAssessmentData(dataToSave);
        setLastSaved(new Date());
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [autoSaveEnabled, selectedGrade, selectedCycle, studentName, sbacScore, iReadyScore, edciteAScore, edciteBScore, elpacOralScore, elpacWrittenScore]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadAssessmentData();
    if (savedData) {
      setSelectedGrade(savedData.selectedGrade || 7);
      setSelectedCycle(savedData.selectedCycle || 1);
      setStudentName(savedData.studentName || '');
      setSbacScore(savedData.sbacScore || '');
      setIReadyScore(savedData.iReadyScore || '');
      setEdciteAScore(savedData.edciteAScore || '');
      setEdciteBScore(savedData.edciteBScore || '');
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
    edciteAScore,
    edciteBScore,
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
            <p className="text-gray-600 text-lg mb-4">
              Track your progress across all five assessment pathways
            </p>

            {/* Student Name Input */}
            <div className="max-w-md mx-auto mb-4">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                placeholder="Enter your name"
              />
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

              {/* Overall Progress Circle */}
              <div className="flex justify-center mt-6">
                <AnimatedCircleProgress
                  progress={overallProgress}
                  size={180}
                  strokeWidth={12}
                  canReclassify={canReclassify}
                />
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Assessment Input Cards */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          {/* ELPAC Card */}
          <AnimatedCard delay={0.2} className="lg:col-span-2 xl:col-span-3">
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
                  Minimum Overall Score: {selectedGrade === 7 ? '1576' : '1590'}
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  Overall Score = (Oral Language × 50%) + (Written Language × 50%)
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🗣️ Oral Language Score
                  </label>
                  <p className="text-xs text-gray-600 mb-2">Listening + Speaking Combined</p>
                  <ScaleOnChange trigger={elpacOralScore}>
                    <input
                      type="number"
                      value={elpacOralScore}
                      onChange={(e) => setElpacOralScore(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter Oral Language score (1150-1900)"
                      min="1150"
                      max="1900"
                    />
                  </ScaleOnChange>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📝 Written Language Score
                  </label>
                  <p className="text-xs text-gray-600 mb-2">Reading + Writing Combined</p>
                  <ScaleOnChange trigger={elpacWrittenScore}>
                    <input
                      type="number"
                      value={elpacWrittenScore}
                      onChange={(e) => setElpacWrittenScore(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter Written Language score (1150-1900)"
                      min="1150"
                      max="1900"
                    />
                  </ScaleOnChange>
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
                      <p className="text-xs opacity-75">Target: {selectedGrade === 7 ? '1576' : '1590'} for Level 4</p>
                    </div>
                    <div>
                      <p>Oral: {elpacResult.oralScore} | Written: {elpacResult.writtenScore}</p>
                      <p className="text-xs opacity-75">50% + 50% = Overall Score</p>
                    </div>
                  </div>
                  <SuccessBadge show={elpacResult.meets} />
                  {!elpacResult.meets && (
                    <p className="font-semibold mt-2">
                      📚 You need {(selectedGrade === 7 ? 1576 : 1590) - elpacResult.overallScore} more overall points to reach Level 4
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </AnimatedCard>

          <div className="lg:col-span-2 xl:col-span-3">
            <h4 className="text-xl font-bold text-gray-700 text-center mb-4">Additional Requirement: Choose ONE Assessment</h4>
            <p className="text-gray-600 text-center mb-6">
              After achieving ELPAC Level 4, you must ALSO meet the requirement for at least ONE of these assessments:
            </p>
          </div>

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

              <ScaleOnChange trigger={sbacScore}>
                <input
                  type="number"
                  value={sbacScore}
                  onChange={(e) => setSbacScore(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter SBAC ELA score"
                />
              </ScaleOnChange>

              {sbacResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg ${
                    sbacResult.meets ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

              <ScaleOnChange trigger={iReadyScore}>
                <input
                  type="number"
                  value={iReadyScore}
                  onChange={(e) => setIReadyScore(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter i-Ready score"
                />
              </ScaleOnChange>

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

          {/* Edcite A Card */}
          <AnimatedCard delay={0.5}>
            <div className={`bg-white rounded-xl p-6 shadow-lg border-3 h-full ${
              edciteAMeets ? 'border-green-400' : 'border-green-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${edciteAMeets ? 'bg-green-100' : 'bg-green-100'}`}>
                  <FileText className={edciteAMeets ? 'text-green-600' : 'text-green-600'} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">Option 3: Edcite A</h3>
                  <p className="text-sm text-gray-600">1st Semester Assessment</p>
                </div>
                {edciteAMeets && (
                  <BounceIn>
                    <CheckCircle className="text-green-600" size={28} />
                  </BounceIn>
                )}
              </div>

              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-green-800">Required Score:</p>
                <p className="text-2xl font-bold text-green-600">{assessmentData.edciteA}</p>
              </div>

              <ScaleOnChange trigger={edciteAScore}>
                <input
                  type="number"
                  value={edciteAScore}
                  onChange={(e) => setEdciteAScore(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-green-500"
                  placeholder="Enter Edcite A score"
                />
              </ScaleOnChange>

              {edciteAScore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg ${
                    edciteAMeets ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  <p className="font-semibold text-sm">Score: {edciteAScore} | Target: {assessmentData.edciteA}</p>
                  <SuccessBadge show={edciteAMeets} />
                </motion.div>
              )}
            </div>
          </AnimatedCard>

          {/* Edcite B Card */}
          <AnimatedCard delay={0.6} className="lg:col-span-2 xl:col-span-1">
            <div className={`bg-white rounded-xl p-6 shadow-lg border-3 h-full ${
              edciteBMeets ? 'border-green-400' : 'border-orange-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${edciteBMeets ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <FileText className={edciteBMeets ? 'text-green-600' : 'text-orange-600'} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">Option 4: Edcite B</h3>
                  <p className="text-sm text-gray-600">2nd Semester Assessment</p>
                </div>
                {edciteBMeets && (
                  <BounceIn>
                    <CheckCircle className="text-green-600" size={28} />
                  </BounceIn>
                )}
              </div>

              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-orange-800">Required Score:</p>
                <p className="text-2xl font-bold text-orange-600">{assessmentData.edciteB}</p>
              </div>

              <ScaleOnChange trigger={edciteBScore}>
                <input
                  type="number"
                  value={edciteBScore}
                  onChange={(e) => setEdciteBScore(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter Edcite B score"
                />
              </ScaleOnChange>

              {edciteBScore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg ${
                    edciteBMeets ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  <p className="font-semibold text-sm">Score: {edciteBScore} | Target: {assessmentData.edciteB}</p>
                  <SuccessBadge show={edciteBMeets} />
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
            {/* Comparison Bar Chart */}
            <div id="comparison-chart">
              <ComparisonBarChart assessmentData={assessmentProgressData} grade={selectedGrade} />
            </div>

            {/* ELPAC Breakdown Chart */}
            {elpacOralScore && elpacWrittenScore && (
              <div id="elpac-breakdown-chart">
                <ElpacBreakdownChart
                  oralScore={elpacOralScore}
                  writtenScore={elpacWrittenScore}
                  grade={selectedGrade}
                />
              </div>
            )}

            {/* Achievement Radar Chart */}
            <div id="radar-chart">
              <AchievementRadarChart assessmentData={assessmentProgressData} />
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
