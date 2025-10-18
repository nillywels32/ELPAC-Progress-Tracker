import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { calculateProgress } from '../../utils/calculations';

/**
 * Multi-Assessment Comparison Bar Chart
 * Shows current scores vs. required scores for all assessments
 */
const ComparisonBarChart = ({ assessmentData, grade }) => {
  if (!assessmentData || assessmentData.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Enter your scores to see the comparison chart
      </div>
    );
  }

  // Transform data for horizontal bar chart
  const chartData = assessmentData.map(assessment => {
    const progress = calculateProgress(assessment.score, assessment.target);

    return {
      name: assessment.name,
      current: parseFloat(assessment.score) || 0,
      target: parseFloat(assessment.target) || 0,
      progress: Math.round(progress),
      meets: assessment.meets,
      shortfall: assessment.shortfall || 0
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200">
        <p className="font-bold text-gray-800 mb-2">{data.name}</p>
        <div className="space-y-1 text-sm">
          <p className="text-blue-600">
            Current Score: <span className="font-bold">{data.current}</span>
          </p>
          <p className="text-purple-600">
            Target Score: <span className="font-bold">{data.target}</span>
          </p>
          <p className={data.meets ? 'text-green-600' : 'text-orange-600'}>
            Progress: <span className="font-bold">{data.progress}%</span>
          </p>
          {!data.meets && data.shortfall > 0 && (
            <p className="text-red-600">
              Points Needed: <span className="font-bold">{data.shortfall}</span>
            </p>
          )}
          <p className={`font-semibold ${data.meets ? 'text-green-600' : 'text-orange-600'}`}>
            {data.meets ? '✅ Requirement Met!' : '⚠️ Not Yet Met'}
          </p>
        </div>
      </div>
    );
  };

  // Color function based on whether requirement is met
  const getBarColor = (meets) => {
    return meets ? '#10b981' : '#3b82f6';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Score Comparison: Current vs. Target
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#6b7280"
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="current"
            name="Current Score"
            radius={[0, 8, 8, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.meets)} />
            ))}
          </Bar>
          <Bar
            dataKey="target"
            name="Target Score"
            fill="#a78bfa"
            radius={[0, 8, 8, 0]}
            opacity={0.6}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Green bars indicate requirements are met • Blue bars show progress</p>
      </div>
    </div>
  );
};

export default ComparisonBarChart;
