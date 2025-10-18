import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * Progress Timeline Chart
 * Track score improvements over time
 */
const ProgressTimelineChart = ({ historyData, assessmentType, target }) => {
  if (!historyData || historyData.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Take multiple assessments to see progress over time
      </div>
    );
  }

  // Transform history data for line chart
  const chartData = historyData.map(entry => ({
    date: new Date(entry.timestamp).toLocaleDateString(),
    score: parseFloat(entry.score) || 0,
    target: target,
    timestamp: entry.timestamp
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200">
        <p className="font-bold text-gray-800 mb-2">{data.date}</p>
        <div className="space-y-1 text-sm">
          <p className="text-blue-600">
            Score: <span className="font-bold">{data.score}</span>
          </p>
          <p className="text-purple-600">
            Target: <span className="font-bold">{data.target}</span>
          </p>
          <p className={data.score >= data.target ? 'text-green-600' : 'text-orange-600'}>
            {data.score >= data.target
              ? '✅ Target Reached!'
              : `⚠️ ${data.target - data.score} points to go`
            }
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Progress Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <YAxis stroke="#6b7280" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine
            y={target}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ value: 'Target', position: 'right', fill: '#ef4444' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            name="Your Score"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Track your improvement over time • Keep taking assessments to build your timeline</p>
      </div>
    </div>
  );
};

export default ProgressTimelineChart;
