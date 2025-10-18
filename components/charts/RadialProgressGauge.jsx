import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

/**
 * Radial Progress Gauge
 * Circular gauge showing overall reclassification progress
 */
const RadialProgressGauge = ({ progress, canReclassify, size = 200 }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress || 0, 0), 100);

  const data = [
    { name: 'Progress', value: normalizedProgress },
    { name: 'Remaining', value: 100 - normalizedProgress }
  ];

  const COLORS = {
    progress: canReclassify ? '#10b981' : '#3b82f6',
    remaining: '#e5e7eb'
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius="70%"
            outerRadius="90%"
            dataKey="value"
            stroke="none"
          >
            <Cell fill={COLORS.progress} />
            <Cell fill={COLORS.remaining} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-4xl font-bold ${canReclassify ? 'text-green-600' : 'text-blue-600'}`}>
            {Math.round(normalizedProgress)}%
          </div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
      </div>
    </div>
  );
};

export default RadialProgressGauge;
