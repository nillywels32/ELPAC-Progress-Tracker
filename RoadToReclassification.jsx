import React, { useState } from 'react';
import { Target, TrendingUp, Calendar, Award, CheckCircle, XCircle, Users, BookOpen, GraduationCap, Printer, MapPin, FileText, BarChart3, TrendingDown } from 'lucide-react';

const ProgressCalculator = ({
  selectedGrade,
  selectedCycle,
  sbacScore,
  iReadyScore,
  edciteAScore,
  edciteBScore,
  elpacResult,
  assessmentData,
  sbacLevels,
  getSbacLevel,
  canReclassify,
  assessmentsMet,
  elpacMeets
}) => {
  // Calculate progress for each assessment
  const calculateSbacProgress = () => {
    if (!sbacScore) return null;
    const score = parseInt(sbacScore);
    const target = selectedGrade === 7 ? 2479 : 2487; // Nearly Met threshold for each grade
    const max = selectedGrade === 7 ? 2810 : 2850; // Max possible score for each grade
    const progress = Math.min((score / target) * 100, 100);
    const meets = getSbacLevel(sbacScore)?.meets || false;
    return { progress, meets, score, target, name: 'SBAC ELA', shortfall: meets ? 0 : Math.max(0, target - score) };
  };

  const calculateIReadyProgress = () => {
    if (!iReadyScore) return null;
    const score = parseInt(iReadyScore);
    const target = assessmentData[selectedGrade].iReady[selectedCycle === 1 ? 'cycle1' : 'cycle2'];
    const progress = Math.min((score / target) * 100, 100);
    const meets = score >= target;
    return { progress, meets, score, target, name: 'i-Ready Reading', shortfall: meets ? 0 : target - score };
  };

  const calculateEdciteAProgress = () => {
    if (!edciteAScore) return null;
    const score = parseInt(edciteAScore);
    const target = assessmentData[selectedGrade].edciteA;
    const progress = Math.min((score / target) * 100, 100);
    const meets = score >= target;
    return { progress, meets, score, target, name: 'Edcite A', shortfall: meets ? 0 : target - score };
  };

  const calculateEdciteBProgress = () => {
    if (!edciteBScore) return null;
    const score = parseInt(edciteBScore);
    const target = assessmentData[selectedGrade].edciteB;
    const progress = Math.min((score / target) * 100, 100);
    const meets = score >= target;
    return { progress, meets, score, target, name: 'Edcite B', shortfall: meets ? 0 : target - score };
  };

  const calculateElpacProgress = () => {
    if (!elpacResult) return null;
    // For ELPAC, we calculate progress toward Level 4 (required for reclassification)
    const currentScore = elpacResult.overallScore;
    const targetScore = assessmentData[selectedGrade].elpac.level4Min;
    const maxScore = 1900; // Maximum possible ELPAC score
    const progress = Math.min((currentScore / targetScore) * 100, 100);
    const meets = elpacResult.meets;

    // Calculate how many points are needed to reach target overall score
    const pointsNeeded = Math.max(0, targetScore - currentScore);

    return {
      progress,
      meets,
      score: currentScore,
      target: targetScore,
      name: 'ELPAC Overall',
      shortfall: meets ? 0 : pointsNeeded
    };
  };

  const assessmentProgress = [
    calculateSbacProgress(),
    calculateIReadyProgress(),
    calculateEdciteAProgress(),
    calculateEdciteBProgress(),
    calculateElpacProgress()
  ].filter(Boolean);

  // Find the closest assessment to completion
  const incompleteAssessments = assessmentProgress.filter(a => !a.meets);
  const closestAssessment = incompleteAssessments.length > 0
    ? incompleteAssessments.reduce((closest, current) =>
        current.progress > closest.progress ? current : closest
      )
    : null;

  // Calculate overall progress based on dual requirements: ELPAC + 1 other assessment
  const elpacProgress = elpacResult ? calculateElpacProgress().progress : 0;
  const otherAssessmentsProgress = assessmentProgress.filter(a => a.name !== 'ELPAC Overall').length > 0
    ? Math.max(...assessmentProgress.filter(a => a.name !== 'ELPAC Overall').map(a => a.progress))
    : 0;

  const overallProgress = canReclassify ? 100 : (
    elpacMeets
      ? Math.min(50 + (otherAssessmentsProgress * 0.5), 100) // If ELPAC met, show progress toward second requirement
      : Math.min(elpacProgress * 0.5, 50) // If ELPAC not met, can only get to 50%
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BarChart3 className="text-blue-600" size={32} />
          <h3 className="text-2xl font-bold text-gray-800">Reclassification Progress Analysis</h3>
        </div>

        {/* Overall Progress Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              {/* Progress circle */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={canReclassify ? "#10b981" : "#3b82f6"}
                strokeWidth="3"
                strokeDasharray={`${overallProgress}, 100`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${canReclassify ? 'text-green-600' : 'text-blue-600'}`}>
                  {Math.round(overallProgress)}%
                </div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className={`text-center p-4 rounded-lg mb-6 ${
          canReclassify
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {canReclassify ? (
            <div>
              <p className="text-xl font-bold">🎉 Congratulations! You're Ready to Reclassify!</p>
              <p>You've met both requirements: ELPAC Level 4 AND {assessmentsMet} additional assessment{assessmentsMet > 1 ? 's' : ''}.</p>
            </div>
          ) : !elpacMeets && closestAssessment ? (
            <div>
              <p className="text-lg font-bold">📚 Focus on ELPAC First!</p>
              <p>You need <strong>ELPAC Level 4</strong> before other assessments count toward reclassification.</p>
            </div>
          ) : elpacMeets && assessmentsMet === 0 ? (
            <div>
              <p className="text-lg font-bold">🎯 Great! Now Choose Your Second Assessment!</p>
              <p>You've achieved <strong>ELPAC Level 4</strong>! Now meet the requirement for just ONE more assessment to qualify.</p>
            </div>
          ) : closestAssessment ? (
            <div>
              <p className="text-lg font-bold">🎯 You're {Math.round(closestAssessment.progress)}% of the way there!</p>
              <p>Your closest pathway is <strong>{closestAssessment.name}</strong> - you need just <strong>{closestAssessment.shortfall}</strong> more points.</p>
              <p className="text-sm mt-1 opacity-75">Remember: You also need ELPAC Level 4!</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold">📚 Get Started! Enter Your Scores!</p>
              <p>Remember: You need ELPAC Level 4 PLUS one other qualifying assessment.</p>
            </div>
          )}
        </div>

        {/* Individual Assessment Progress Bars */}
        {assessmentProgress.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 text-center mb-4">Individual Assessment Progress</h4>
            {assessmentProgress.map((assessment, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{assessment.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {assessment.score}/{assessment.target}
                    </span>
                    {assessment.meets && <CheckCircle className="text-green-600" size={16} />}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      assessment.meets
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                    style={{ width: `${Math.min(assessment.progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{Math.round(assessment.progress)}% complete</span>
                  {!assessment.meets && (
                    <span className="text-orange-600">
                      {assessment.name === 'ELPAC Overall'
                        ? `Need ${assessment.shortfall} more overall points to reach Level 4`
                        : `${assessment.shortfall} points needed`
                      }
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Strategic Recommendations */}
        {!canReclassify && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-yellow-600" size={20} />
              <h5 className="font-bold text-yellow-800">Strategic Focus Recommendation</h5>
            </div>
            {!elpacMeets ? (
              <p className="text-yellow-700 text-sm">
                <strong>🎯 Priority: Focus on ELPAC first!</strong> You need Level 4 on ELPAC before any other assessments count toward reclassification.
              </p>
            ) : assessmentsMet === 0 && closestAssessment ? (
              <p className="text-yellow-700 text-sm">
                <strong>🎉 Great! You have ELPAC Level 4!</strong> Now focus on <strong>{closestAssessment.name}</strong> -
                you're {Math.round(closestAssessment.progress)}% there and need just <strong>{closestAssessment.shortfall}</strong> more points.
              </p>
            ) : closestAssessment ? (
              <p className="text-yellow-700 text-sm">
                Work on both ELPAC and <strong>{closestAssessment.name}</strong>. Your closest assessment is {Math.round(closestAssessment.progress)}% complete,
                but remember you need ELPAC Level 4 too!
              </p>
            ) : (
              <p className="text-yellow-700 text-sm">
                <strong>Start with ELPAC!</strong> Focus on reaching Level 4 first, then choose your strongest alternative assessment.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RoadToReclassification = () => {
  const [selectedGrade, setSelectedGrade] = useState(7);
  const [selectedCycle, setSelectedCycle] = useState(1);
  const [showPrintView, setShowPrintView] = useState(false);

  // Assessment Scores
  const [sbacScore, setSbacScore] = useState('');
  const [iReadyScore, setIReadyScore] = useState('');
  const [edciteAScore, setEdciteAScore] = useState('');
  const [edciteBScore, setEdciteBScore] = useState('');

  // ELPAC Scores
  const [elpacOralScore, setElpacOralScore] = useState('');
  const [elpacWrittenScore, setElpacWrittenScore] = useState('');

  const assessmentData = {
    7: {
      iReady: { cycle1: 562, cycle2: 567 },
      edciteA: 40,
      edciteB: 38,
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

  const sbacLevels = {
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

  // Helper functions
  const getSbacLevel = (score) => {
    const numScore = parseInt(score);
    const gradeLevels = sbacLevels[selectedGrade];
    for (const [level, data] of Object.entries(gradeLevels)) {
      if (numScore >= data.min && numScore <= data.max) {
        return { level, meets: data.meets };
      }
    }
    return null;
  };

  const getIReadyStatus = (score) => {
    const target = assessmentData[selectedGrade].iReady[selectedCycle === 1 ? 'cycle1' : 'cycle2'];
    return parseInt(score) >= target;
  };

  const getEdciteAStatus = (score) => {
    return parseInt(score) >= assessmentData[selectedGrade].edciteA;
  };

  const getEdciteBStatus = (score) => {
    return parseInt(score) >= assessmentData[selectedGrade].edciteB;
  };

  // ELPAC overall level calculation using oral and written language scores
  const calculateElpacOverallLevel = () => {
    if (!elpacOralScore || !elpacWrittenScore) return null;

    const oralScore = parseInt(elpacOralScore);
    const writtenScore = parseInt(elpacWrittenScore);

    // Calculate overall score: 50% oral + 50% written
    const overallScore = Math.round((oralScore * 0.5) + (writtenScore * 0.5));

    // Determine level based on grade-specific ranges
    const elpacLevels = assessmentData[selectedGrade].elpac.levels;
    let level = 1;
    for (const [levelNum, range] of Object.entries(elpacLevels)) {
      if (overallScore >= range.min && overallScore <= range.max) {
        level = parseInt(levelNum);
        break;
      }
    }

    return {
      level: level,
      overallScore: overallScore,
      meets: level >= 4, // Level 4 required for reclassification
      oralScore: oralScore,
      writtenScore: writtenScore
    };
  };

  // Check which assessments are met
  const sbacResult = sbacScore ? getSbacLevel(sbacScore) : null;
  const iReadyMeets = iReadyScore ? getIReadyStatus(iReadyScore) : false;
  const edciteAMeets = edciteAScore ? getEdciteAStatus(edciteAScore) : false;
  const edciteBMeets = edciteBScore ? getEdciteBStatus(edciteBScore) : false;
  const elpacResult = calculateElpacOverallLevel();

  // CRITICAL: For reclassification, students need ELPAC Level 4 AND at least one other assessment
  const otherAssessmentsMet = [sbacResult?.meets, iReadyMeets, edciteAMeets, edciteBMeets].filter(Boolean).length;
  const elpacMeets = elpacResult?.meets || false;
  const canReclassify = elpacMeets && otherAssessmentsMet > 0;

  const currentIReadyTarget = assessmentData[selectedGrade].iReady[selectedCycle === 1 ? 'cycle1' : 'cycle2'];

  if (showPrintView) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white">
        <div className="text-center mb-6">
          <button
            onClick={() => setShowPrintView(false)}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 print:hidden"
          >
            ← Back to Interactive View
          </button>
          <button
            onClick={() => window.print()}
            className="mb-4 ml-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 print:hidden flex items-center gap-2"
          >
            <Printer size={16} />
            Print This Page
          </button>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">Road to Reclassification</h1>
          <p className="text-lg text-gray-600">Grade {selectedGrade} Assessment Progress Report</p>
          <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className={`mb-6 p-4 rounded-lg text-center ${
          canReclassify ? 'bg-green-100 border-2 border-green-300' : 'bg-orange-100 border-2 border-orange-300'
        }`}>
          <h2 className={`text-xl font-bold ${canReclassify ? 'text-green-800' : 'text-orange-800'}`}>
            {canReclassify
              ? `🎉 Reclassification Eligible!`
              : 'Continue Working Toward Your Goal!'}
          </h2>
          <p className={`text-sm mt-2 ${canReclassify ? 'text-green-700' : 'text-orange-700'}`}>
            Requirements: ELPAC Level 4 {elpacMeets ? '✅' : '❌'} + At least 1 other assessment {otherAssessmentsMet > 0 ? '✅' : '❌'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* SBAC */}
          <div className="border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">Option 1: SBAC ELA</h3>
            <p className="text-sm text-gray-600 mb-2">Required: Nearly Met or Above (Min: {selectedGrade === 7 ? '2479' : '2487'})</p>
            <div className="flex items-center gap-2">
              {sbacResult?.meets ? (
                <CheckCircle className="text-green-600" size={16} />
              ) : (
                <XCircle className="text-red-600" size={16} />
              )}
              <span className="text-sm">
                {sbacScore ? `Score: ${sbacScore} (${sbacResult?.level})` : 'Not entered'}
              </span>
            </div>
          </div>

          {/* i-Ready */}
          <div className="border-2 border-purple-200 rounded-lg p-4">
            <h3 className="font-bold text-purple-800 mb-2">Option 2: i-Ready Reading</h3>
            <p className="text-sm text-gray-600 mb-2">
              Required: {currentIReadyTarget} (Cycle {selectedCycle})
            </p>
            <div className="flex items-center gap-2">
              {iReadyMeets ? (
                <CheckCircle className="text-green-600" size={16} />
              ) : (
                <XCircle className="text-red-600" size={16} />
              )}
              <span className="text-sm">
                {iReadyScore ? `Score: ${iReadyScore}` : 'Not entered'}
              </span>
            </div>
          </div>

          {/* Edcite A */}
          <div className="border-2 border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-800 mb-2">Option 3: Edcite A</h3>
            <p className="text-sm text-gray-600 mb-2">
              Required: {assessmentData[selectedGrade].edciteA}
            </p>
            <div className="flex items-center gap-2">
              {edciteAMeets ? (
                <CheckCircle className="text-green-600" size={16} />
              ) : (
                <XCircle className="text-red-600" size={16} />
              )}
              <span className="text-sm">
                {edciteAScore ? `Score: ${edciteAScore}` : 'Not entered'}
              </span>
            </div>
          </div>

          {/* Edcite B */}
          <div className="border-2 border-orange-200 rounded-lg p-4">
            <h3 className="font-bold text-orange-800 mb-2">Option 4: Edcite B</h3>
            <p className="text-sm text-gray-600 mb-2">
              Required: {assessmentData[selectedGrade].edciteB}
            </p>
            <div className="flex items-center gap-2">
              {edciteBMeets ? (
                <CheckCircle className="text-green-600" size={16} />
              ) : (
                <XCircle className="text-red-600" size={16} />
              )}
              <span className="text-sm">
                {edciteBScore ? `Score: ${edciteBScore}` : 'Not entered'}
              </span>
            </div>
          </div>

          {/* ELPAC */}
          <div className="border-2 border-indigo-200 rounded-lg p-4 col-span-2">
            <h3 className="font-bold text-indigo-800 mb-2">ELPAC Assessment</h3>
            <p className="text-sm text-gray-600 mb-2">Required: Level 4 (Min Score: {selectedGrade === 7 ? '1576' : '1590'})</p>
            <div className="flex items-center gap-2">
              {elpacResult?.meets ? (
                <CheckCircle className="text-green-600" size={16} />
              ) : (
                <XCircle className="text-red-600" size={16} />
              )}
              <span className="text-sm">
                {elpacResult
                  ? `Level ${elpacResult.level} (Overall: ${elpacResult.overallScore} | Oral: ${elpacResult.oralScore} | Written: ${elpacResult.writtenScore})`
                  : 'Not entered'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 pt-4">
          <h3 className="font-bold mb-2">Remember:</h3>
          <ul className="text-sm space-y-1">
            <li>• <strong>ELPAC Level 4 is MANDATORY</strong> - this is required for everyone</li>
            <li>• You must ALSO meet at least ONE other assessment requirement</li>
            <li>• Keep this paper and update it as you take new assessments</li>
            <li>• Talk to your ELL teacher about your progress</li>
            <li>• There are additional requirements beyond these basic skills</li>
            <li>• Focus on ELPAC first, then choose your strongest alternative assessment</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MapPin className="text-blue-600" size={40} />
          <h1 className="text-4xl font-bold text-gray-800">Road to Reclassification</h1>
        </div>
        <p className="text-gray-600 text-lg mb-4">
          Track your progress across all five assessment pathways
        </p>
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setSelectedGrade(7)}
            className={`px-6 py-3 rounded-lg transition-all ${
              selectedGrade === 7
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            7th Grade
          </button>
          <button
            onClick={() => setSelectedGrade(8)}
            className={`px-6 py-3 rounded-lg transition-all ${
              selectedGrade === 8
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            8th Grade
          </button>
        </div>
        <button
          onClick={() => setShowPrintView(true)}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 mx-auto"
        >
          <Printer size={20} />
          Generate Print Report
        </button>
      </div>

      {/* Progress Banner */}
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
              <div className={`flex items-center gap-2 ${elpacMeets ? 'text-green-700' : 'text-orange-700'}`}>
                {elpacMeets ? '✅' : '🔲'} ELPAC Level 4 (REQUIRED)
              </div>
              <div className={`flex items-center gap-2 ${otherAssessmentsMet > 0 ? 'text-green-700' : 'text-orange-700'}`}>
                {otherAssessmentsMet > 0 ? '✅' : '🔲'} At least 1 other assessment
              </div>
            </div>
          </div>
        </div>
        {/* Road decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800 opacity-20"></div>
        <div className="absolute bottom-1 left-4 right-4 h-0.5 border-t-2 border-dashed border-white opacity-60"></div>
      </div>

      {/* Assessment Options Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">

        {/* ELPAC - Most Important Assessment */}
        <div className={`bg-white rounded-xl p-6 shadow-lg border-3 transition-all lg:col-span-2 xl:col-span-3 ${
          elpacResult?.meets ? 'border-green-400 shadow-green-100' : 'border-indigo-200'
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
            {elpacResult?.meets && <CheckCircle className="text-green-600 ml-auto" size={32} />}
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
              <input
                type="number"
                value={elpacOralScore}
                onChange={(e) => setElpacOralScore(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter Oral Language score (1150-1900)"
                min="1150"
                max="1900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📝 Written Language Score
              </label>
              <p className="text-xs text-gray-600 mb-2">Reading + Writing Combined</p>
              <input
                type="number"
                value={elpacWrittenScore}
                onChange={(e) => setElpacWrittenScore(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter Written Language score (1150-1900)"
                min="1150"
                max="1900"
              />
            </div>
          </div>

          {elpacResult && (
            <div className={`p-4 rounded-lg border-2 ${
              elpacResult.meets ? 'bg-green-100 text-green-800 border-green-300' : 'bg-orange-100 text-orange-800 border-orange-300'
            }`}>
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
              <p className="font-semibold">
                {elpacResult.meets
                  ? '🎉 Congratulations! This meets the reclassification requirement!'
                  : `📚 You need ${(selectedGrade === 7 ? 1576 : 1590) - elpacResult.overallScore} more overall points to reach Level 4`
                }
              </p>
              {!elpacResult.meets && (
                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800 font-medium mb-2">🎯 Here's exactly what you need to do:</p>
                  <div className="bg-white p-3 rounded border border-orange-300 mb-2">
                    <p className="text-sm font-semibold text-orange-900 mb-1">
                      To gain {(selectedGrade === 7 ? 1576 : 1590) - elpacResult.overallScore} overall points, you need to improve your combined scores by {((selectedGrade === 7 ? 1576 : 1590) - elpacResult.overallScore) * 2} total points.
                    </p>
                    <p className="text-xs text-orange-700 mb-2">Here are some ways to achieve this:</p>
                    <ul className="text-xs text-orange-700 space-y-1">
                      <li>• <strong>Option 1:</strong> Improve both Oral and Written by {((selectedGrade === 7 ? 1576 : 1590) - elpacResult.overallScore)} points each</li>
                      <li>• <strong>Option 2:</strong> Focus on your stronger area and improve it by {((selectedGrade === 7 ? 1576 : 1590) - elpacResult.overallScore) * 2} points</li>
                      <li>• <strong>Option 3:</strong> Any combination that adds up to {((selectedGrade === 7 ? 1576 : 1590) - elpacResult.overallScore) * 2} total points</li>
                    </ul>
                  </div>
                  <p className="text-xs text-orange-700 font-medium">Remember: Overall Score = (Oral + Written) ÷ 2</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 xl:col-span-3">
          <h4 className="text-xl font-bold text-gray-700 text-center mb-4">Additional Requirement: Choose ONE Assessment</h4>
          <p className="text-gray-600 text-center mb-6">
            After achieving ELPAC Level 4, you must ALSO meet the requirement for at least ONE of these assessments:
          </p>
        </div>

        {/* Option 1: SBAC */}
        <div className={`bg-white rounded-xl p-6 shadow-lg border-3 transition-all ${
          sbacResult?.meets ? 'border-green-400 shadow-green-100' : 'border-blue-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${sbacResult?.meets ? 'bg-green-100' : 'bg-blue-100'}`}>
              <BookOpen className={sbacResult?.meets ? 'text-green-600' : 'text-blue-600'} size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Option 1: SBAC ELA</h3>
              <p className="text-sm text-gray-600">Smarter Balanced Assessment</p>
            </div>
            {sbacResult?.meets && <CheckCircle className="text-green-600 ml-auto" size={28} />}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="font-semibold text-blue-800">Required Level:</p>
            <p className="text-xl font-bold text-blue-600">Nearly Met or Above</p>
            <p className="text-sm text-blue-700">Minimum Score: {selectedGrade === 7 ? '2479' : '2487'}</p>
          </div>

          <input
            type="number"
            value={sbacScore}
            onChange={(e) => setSbacScore(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-4"
            placeholder="Enter SBAC ELA score (e.g., 2500)"
          />

          {sbacResult && (
            <div className={`p-4 rounded-lg ${
              sbacResult.meets ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <p className="font-semibold">Level: {sbacResult.level}</p>
              <p className="text-sm">
                {sbacResult.meets ? '✅ Meets requirement!' : '❌ Need Nearly Met or higher'}
              </p>
            </div>
          )}
        </div>

        {/* Option 2: i-Ready */}
        <div className={`bg-white rounded-xl p-6 shadow-lg border-3 transition-all ${
          iReadyMeets ? 'border-green-400 shadow-green-100' : 'border-purple-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${iReadyMeets ? 'bg-green-100' : 'bg-purple-100'}`}>
              <Target className={iReadyMeets ? 'text-green-600' : 'text-purple-600'} size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Option 2: i-Ready Reading</h3>
              <p className="text-sm text-gray-600">Diagnostic Assessment</p>
            </div>
            {iReadyMeets && <CheckCircle className="text-green-600 ml-auto" size={28} />}
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedCycle(1)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                selectedCycle === 1 ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Cycle 1
            </button>
            <button
              onClick={() => setSelectedCycle(2)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm ${
                selectedCycle === 2 ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Cycle 2
            </button>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg mb-4">
            <p className="font-semibold text-purple-800">Required Score:</p>
            <p className="text-2xl font-bold text-purple-600">{currentIReadyTarget}</p>
          </div>

          <input
            type="number"
            value={iReadyScore}
            onChange={(e) => setIReadyScore(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-4"
            placeholder="Enter i-Ready score"
          />

          {iReadyScore && (
            <div className={`p-4 rounded-lg ${
              iReadyMeets ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              <p className="font-semibold">Score: {iReadyScore} | Target: {currentIReadyTarget}</p>
              <p className="text-sm">
                {iReadyMeets
                  ? '✅ Meets requirement!'
                  : `❌ Need ${currentIReadyTarget - parseInt(iReadyScore)} more points`
                }
              </p>
            </div>
          )}
        </div>

        {/* Option 3: Edcite A */}
        <div className={`bg-white rounded-xl p-6 shadow-lg border-3 transition-all ${
          edciteAMeets ? 'border-green-400 shadow-green-100' : 'border-green-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${edciteAMeets ? 'bg-green-100' : 'bg-green-100'}`}>
              <FileText className={edciteAMeets ? 'text-green-600' : 'text-green-600'} size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Option 3: Edcite A</h3>
              <p className="text-sm text-gray-600">1st Semester Assessment</p>
            </div>
            {edciteAMeets && <CheckCircle className="text-green-600 ml-auto" size={28} />}
          </div>

          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="font-semibold text-green-800">Required Score:</p>
            <p className="text-2xl font-bold text-green-600">{assessmentData[selectedGrade].edciteA}</p>
          </div>

          <input
            type="number"
            value={edciteAScore}
            onChange={(e) => setEdciteAScore(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-4"
            placeholder="Enter Edcite A score"
          />

          {edciteAScore && (
            <div className={`p-4 rounded-lg ${
              edciteAMeets ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              <p className="font-semibold">Score: {edciteAScore} | Target: {assessmentData[selectedGrade].edciteA}</p>
              <p className="text-sm">
                {edciteAMeets
                  ? '✅ Meets requirement!'
                  : `❌ Need ${assessmentData[selectedGrade].edciteA - parseInt(edciteAScore)} more points`
                }
              </p>
            </div>
          )}
        </div>

        {/* Option 4: Edcite B */}
        <div className={`bg-white rounded-xl p-6 shadow-lg border-3 transition-all ${
          edciteBMeets ? 'border-green-400 shadow-green-100' : 'border-orange-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${edciteBMeets ? 'bg-green-100' : 'bg-orange-100'}`}>
              <FileText className={edciteBMeets ? 'text-green-600' : 'text-orange-600'} size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Option 4: Edcite B</h3>
              <p className="text-sm text-gray-600">2nd Semester Assessment</p>
            </div>
            {edciteBMeets && <CheckCircle className="text-green-600 ml-auto" size={28} />}
          </div>

          <div className="bg-orange-50 p-4 rounded-lg mb-4">
            <p className="font-semibold text-orange-800">Required Score:</p>
            <p className="text-2xl font-bold text-orange-600">{assessmentData[selectedGrade].edciteB}</p>
          </div>

          <input
            type="number"
            value={edciteBScore}
            onChange={(e) => setEdciteBScore(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-4"
            placeholder="Enter Edcite B score"
          />

          {edciteBScore && (
            <div className={`p-4 rounded-lg ${
              edciteBMeets ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              <p className="font-semibold">Score: {edciteBScore} | Target: {assessmentData[selectedGrade].edciteB}</p>
              <p className="text-sm">
                {edciteBMeets
                  ? '✅ Meets requirement!'
                  : `❌ Need ${assessmentData[selectedGrade].edciteB - parseInt(edciteBScore)} more points`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Calculation Section */}
      {(sbacScore || iReadyScore || edciteAScore || edciteBScore || elpacResult) && (
        <div className="mb-8">
          <ProgressCalculator
            selectedGrade={selectedGrade}
            selectedCycle={selectedCycle}
            sbacScore={sbacScore}
            iReadyScore={iReadyScore}
            edciteAScore={edciteAScore}
            edciteBScore={edciteBScore}
            elpacResult={elpacResult}
            assessmentData={assessmentData}
            sbacLevels={sbacLevels}
            getSbacLevel={getSbacLevel}
            canReclassify={canReclassify}
            assessmentsMet={otherAssessmentsMet}
            elpacMeets={elpacMeets}
          />
        </div>
      )}

      {/* Support Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
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
      </div>
    </div>
  );
};

export default RoadToReclassification;
