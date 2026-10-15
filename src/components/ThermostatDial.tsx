import React from 'react';

interface ThermostatDialProps {
  percentage: number;
  totalCount: number;
  filledCount: number;
}

export const ThermostatDial: React.FC<ThermostatDialProps> = ({
  percentage,
  totalCount,
  filledCount,
}) => {
  // We want an arc from -135deg to +135deg (270 degrees total)
  const totalTicks = 45;
  const activeTicks = Math.round((percentage / 100) * totalTicks);
  const radius = 80;
  const centerX = 110;
  const centerY = 110;

  // Generate tick marks
  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    // Angle in degrees from -135 to 135
    const angleDeg = -135 + (i / (totalTicks - 1)) * 270;
    const angleRad = (angleDeg * Math.PI) / 180;
    
    // Outer and inner points of the tick mark
    const x1 = centerX + Math.cos(angleRad) * (radius - 12);
    const y1 = centerY + Math.sin(angleRad) * (radius - 12);
    const x2 = centerX + Math.cos(angleRad) * radius;
    const y2 = centerY + Math.sin(angleRad) * radius;

    const isActive = i <= activeTicks;

    return {
      index: i,
      x1,
      y1,
      x2,
      y2,
      isActive,
      angleDeg,
    };
  });

  // Needle angle based on current percentage
  const needleAngle = -135 + (percentage / 100) * 270;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleEndX = centerX + Math.cos(needleRad) * (radius + 2);
  const needleEndY = centerY + Math.sin(needleRad) * (radius + 2);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="220" height="150" viewBox="0 0 220 150" className="overflow-visible">
        {/* Ticks */}
        {ticks.map((tick) => (
          <line
            key={tick.index}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.isActive ? '#111418' : '#E2E8F0'}
            strokeWidth={tick.index % 5 === 0 ? 2.5 : 1.5}
            strokeLinecap="round"
            className="transition-colors duration-300"
          />
        ))}

        {/* Small pointer needle line */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleEndX}
          y2={needleEndY}
          stroke="#4F46E5"
          strokeWidth="2"
          strokeDasharray="3 3"
          className="opacity-70 transition-all duration-300"
        />

        {/* Needle head circle */}
        <circle
          cx={needleEndX}
          cy={needleEndY}
          r="4.5"
          fill="#4F46E5"
          className="transition-all duration-300"
        />
      </svg>

      {/* Center readout */}
      <div className="absolute top-[58px] flex flex-col items-center text-center">
        <div className="text-3xl font-bold tracking-tight text-neutral-900 flex items-baseline">
          {percentage}
          <span className="text-lg font-semibold ml-0.5">%</span>
        </div>
        <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mt-0.5">
          {filledCount}/{totalCount} Filled
        </div>
      </div>

      {/* Bottom Range Labels */}
      <div className="w-[180px] flex justify-between text-[11px] font-semibold text-neutral-400 mt-[-10px] px-1">
        <span>0%</span>
        <span className="text-neutral-500 font-medium text-[10px]">
          {percentage === 100 ? 'Ready' : 'In Progress'}
        </span>
        <span>100%</span>
      </div>
    </div>
  );
};
