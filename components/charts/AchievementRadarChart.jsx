import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { calculatePercentageToGoal } from '../../utils/calculations';

/**
 * Achievement Radar Chart
 * Spider/radar chart showing proficiency across all 5 assessments
 */
const AchievementRadarChart = ({ assessmentData }) => {
  if (!assessmentData || assessmentData.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Enter your scores to see the achievement radar
      </div>
    );
  }

  // Transform data for radar chart (percentage toward goal)
  const radarData = assessmentData.map(assessment => ({
    subject: assessment.shortName || assessment.name,
    fullName: assessment.name,
    progress: Math.round(calculatePercentageToGoal(assessment.score, assessment.target)),
    score: assessment.score,
    target: assessment.target,
    meets: assessment.meets,
    fullMark: 100
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-gray-200">
        <p className="font-bold text-gray-800 mb-1">{data.fullName}</p>
        <div className="space-y-1 text-xs">
          <p className="text-blue-600">
            Score: <span className="font-bold">{data.score}</span> / {data.target}
          </p>
          <p className={data.meets ? 'text-green-600' : 'text-orange-600'}>
            {data.progress}% toward goal
          </p>
          <p className={`font-semibold ${data.meets ? 'text-green-600' : 'text-gray-600'}`}>
            {data.meets ? '✅ Met' : '⚠️ In Progress'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Overall Achievement Profile
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            stroke="#6b7280"
            tick={{ fill: '#4b5563', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            stroke="#9ca3af"
            tick={{ fill: '#6b7280', fontSize: 10 }}
          />
          <Radar
            name="Progress"
            dataKey="progress"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 bg-blue-500 rounded opacity-60"></div>
          <span>Your Progress (%)</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Each axis represents progress toward meeting that assessment's requirement
        </p>
      </div>
    </div>
  );
};

export default AchievementRadarChart;
