import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { calculateElpacOverallScore } from '../../utils/calculations';

/**
 * ELPAC Domain Breakdown Chart
 * Shows Oral vs. Written language scores with target line
 */
const ElpacBreakdownChart = ({ oralScore, writtenScore, grade }) => {
  if (!oralScore || !writtenScore) {
    return (
      <div className="text-center p-8 text-gray-500">
        Enter both ELPAC scores to see the breakdown
      </div>
    );
  }

  const oral = parseFloat(oralScore);
  const written = parseFloat(writtenScore);
  const overall = calculateElpacOverallScore(oral, written);
  const target = grade === 7 ? 1576 : 1590;
  const meetsOral = oral >= target;
  const meetsWritten = written >= target;

  const data = [
    {
      name: 'Oral Language',
      score: oral,
      target: target,
      meets: meetsOral,
      label: '🗣️ Oral'
    },
    {
      name: 'Written Language',
      score: written,
      target: target,
      meets: meetsWritten,
      label: '📝 Written'
    },
    {
      name: 'Overall Score',
      score: overall,
      target: target,
      meets: overall >= target,
      label: '🎯 Overall'
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200">
        <p className="font-bold text-gray-800 mb-2">{data.name}</p>
        <div className="space-y-1 text-sm">
          <p className="text-blue-600">
            Score: <span className="font-bold">{data.score}</span>
          </p>
          <p className="text-purple-600">
            Target (Level 4): <span className="font-bold">{data.target}</span>
          </p>
          <p className={data.meets ? 'text-green-600' : 'text-orange-600'}>
            {data.meets ? '✅ Meets Level 4' : `⚠️ Need ${data.target - data.score} more points`}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-indigo-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        ELPAC Score Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" stroke="#6b7280" />
          <YAxis
            stroke="#6b7280"
            domain={[1150, 1900]}
            ticks={[1150, 1300, 1450, 1576, 1590, 1750, 1900]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={target}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ value: `Level 4 Target: ${target}`, position: 'right', fill: '#ef4444' }}
          />
          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.meets ? '#10b981' : '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-gray-600">Oral Language</p>
          <p className="text-xl font-bold text-blue-600">{oral}</p>
          <p className="text-xs text-gray-500">Listening + Speaking</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-gray-600">Written Language</p>
          <p className="text-xl font-bold text-purple-600">{written}</p>
          <p className="text-xs text-gray-500">Reading + Writing</p>
        </div>
        <div className={`p-3 rounded-lg ${overall >= target ? 'bg-green-50' : 'bg-orange-50'}`}>
          <p className="text-gray-600">Overall Score</p>
          <p className={`text-xl font-bold ${overall >= target ? 'text-green-600' : 'text-orange-600'}`}>
            {overall}
          </p>
          <p className="text-xs text-gray-500">Average of Both</p>
        </div>
      </div>
    </div>
  );
};

export default ElpacBreakdownChart;
