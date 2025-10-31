import React from 'react';

interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const SpinButton: React.FC<SpinButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-full rounded-full flex flex-col items-center justify-center 
                 bg-white text-gray-800
                 border-2 border-gray-300
                 shadow-lg
                 transition-all duration-200
                 hover:bg-gray-100
                 active:scale-95
                 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <span className="text-xl sm:text-2xl md:text-4xl font-bold uppercase tracking-widest">
        Spin
      </span>
      <span className="text-[10px] sm:text-xs text-gray-500 tracking-wider">
        ctrl+enter
      </span>
    </button>
  );
};

export default SpinButton;
