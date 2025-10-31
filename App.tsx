import React, { useState, useCallback, useEffect } from 'react';
import Wheel from './components/Wheel';
import { WHEEL_WORDS, WHEEL_VERBS_PAST_SIMPLE } from './constants';

const PointerIcon = () => (
    <svg width="50" height="40" viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
        <path d="M48 19L18 37.3205V0.679491L48 19Z" fill="white"/>
    </svg>
);

const VerbQuizModal = ({ verb, onClose }: { verb: string | null; onClose: () => void; }) => {
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (verb) {
      setUserInput('');
      setFeedback(null);
      setIsCorrect(false);
    }
  }, [verb]);

  if (!verb) return null;

  const handleCheck = () => {
    const correctAnswer = WHEEL_VERBS_PAST_SIMPLE[verb];
    const userIsCorrect = correctAnswer.includes('/')
      ? correctAnswer.split('/').includes(userInput.trim().toLowerCase())
      : userInput.trim().toLowerCase() === correctAnswer;

    setIsCorrect(userIsCorrect);
    if (userIsCorrect) {
      setFeedback(`Correct! "${verb.toUpperCase()}" in past simple is "${correctAnswer}"`);
    } else {
      setFeedback(`Not quite. "${verb.toUpperCase()}" in past simple is "${correctAnswer}"`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !feedback) {
      handleCheck();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div 
        className="bg-[#2D344B]/80 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8 text-center text-white border border-gray-700/50 w-full max-w-md"
      >
        <h2 className="text-4xl sm:text-5xl font-bold uppercase mb-4 tracking-widest">{verb}</h2>
        
        <input 
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!!feedback}
          className="w-full bg-[#343A53] border border-gray-600 rounded-md text-white text-center text-xl p-3 mb-5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200"
          placeholder="Type past simple form"
          aria-label="Past simple input"
        />

        {!feedback ? (
          <button 
            onClick={handleCheck}
            className="bg-[#22c55e] text-white font-bold py-3 px-8 rounded-md hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all duration-300 w-full text-lg"
          >
            Check
          </button>
        ) : (
          <button 
            onClick={onClose}
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 w-full text-lg"
          >
            Continue
          </button>
        )}

        {feedback && (
          <p className={`mt-4 text-md ${isCorrect ? 'text-green-400' : 'text-amber-400'}`}>
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
};


export default function App() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedWord(null);

    const totalItems = WHEEL_WORDS.length;
    const randomItemIndex = Math.floor(Math.random() * totalItems);
    const degreesPerItem = 360 / totalItems;
    
    // Calculate the final rotation angle for the wheel.
    // The pointer is at 180 degrees (9 o'clock).
    // Each word is initially positioned at an angle of `(index * degreesPerItem) - 90` degrees
    // due to CSS positioning ('top-*' places it at 12 o'clock, which is -90 degrees).
    // We solve for `targetAngle`: `targetAngle + (initialAngle) = 180`, which simplifies to the calculation below.
    const targetAngle = 270 - (randomItemIndex * degreesPerItem);

    const fullSpins = 6 + Math.floor(Math.random() * 4);
    const newRotation = (Math.floor(rotation / 360) * 360) + (fullSpins * 360) + targetAngle;
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedWord(WHEEL_WORDS[randomItemIndex]);
    }, 6000); 
  }, [isSpinning, rotation]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        handleSpin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSpin]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="relative w-full max-w-[320px] sm:max-w-[480px] md:max-w-[600px] flex items-center justify-center">
        <div className="absolute top-1/2 left-0 z-20 -translate-y-1/2 -translate-x-1/2">
            <PointerIcon />
        </div>
        <Wheel rotation={rotation} onSpin={handleSpin} isSpinning={isSpinning} />
      </div>

      <VerbQuizModal verb={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}