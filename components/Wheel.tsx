import React, { useMemo } from 'react';
import { WHEEL_COLORS } from '../constants';
import SpinButton from './SpinButton';

interface WheelProps {
  rotation: number;
  onSpin: () => void;
  isSpinning: boolean;
  words: string[];
}

const Wheel: React.FC<WheelProps> = ({ rotation, onSpin, isSpinning, words }) => {
  const segmentAngle = words.length > 0 ? 360 / words.length : 0;

  const conicGradientStyle = useMemo(() => {
    if (words.length === 0) {
      return { background: '#4b5563' }; // gray-600
    }
    const gradientParts = words.map((_, i) => {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
      return `${color} ${startAngle}deg ${endAngle}deg`;
    });
    return {
      // Offset the gradient so the words appear in the middle of each color segment
      background: `conic-gradient(from -${segmentAngle / 2}deg, ${gradientParts.join(', ')})`,
    };
  }, [segmentAngle, words]);

  return (
    <div className="relative w-full aspect-square rounded-full shadow-2xl">
      {/* Outer border */}
      <div className="absolute inset-0 rounded-full bg-gray-900 p-2 sm:p-3">
        {/* Inner shadow */}
        <div className="relative w-full h-full rounded-full bg-gray-800 shadow-inner">
          <div
            className="w-full h-full rounded-full overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <div className="absolute inset-0" style={conicGradientStyle} />
            
            {/* Words */}
            {words.map((word, i) => {
              const angle = i * segmentAngle;
              return (
                <div
                  key={`word-${word}`} // Use the word for a stable key
                  className="absolute w-full h-full flex justify-center transition-transform duration-300 ease-in-out"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span
                    className="absolute top-8 sm:top-10 md:top-12 text-[11px] sm:text-xs md:text-sm font-bold text-white uppercase tracking-wider"
                    style={{
                      transform: 'rotate(90deg)',
                      transformOrigin: 'center',
                    }}
                  >
                    {word}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Center Hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28%] h-[28%]">
        <SpinButton onClick={onSpin} disabled={isSpinning} />
      </div>
    </div>
  );
};

export default Wheel;