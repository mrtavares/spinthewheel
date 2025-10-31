
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Wheel from './components/Wheel';
import { WHEEL_WORDS, WHEEL_VERBS_PAST_SIMPLE } from './constants';
import { useTickSound } from './hooks/useTickSound';

const PointerIcon = () => (
    <svg width="50" height="40" viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
        <path d="M48 19L18 37.3205V0.679491L48 19Z" fill="white"/>
    </svg>
);

interface VerbQuizModalProps {
  verb: string | null;
  onClose: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
  onRemoveWord: (word: string) => void;
}

const VerbQuizModal = ({ verb, onClose, onCorrect, onIncorrect, onRemoveWord }: VerbQuizModalProps) => {
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (verb) {
      setUserInput('');
      setFeedback(null);
      setIsCorrect(false);
      // Ensure the input is focused after the modal is visible and state is reset.
      // A small timeout helps guarantee the element is ready.
      setTimeout(() => inputRef.current?.focus(), 50);
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
      onCorrect();
    } else {
      setFeedback(`Not quite. "${verb.toUpperCase()}" in past simple is "${correctAnswer}"`);
      onIncorrect();
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
          ref={inputRef}
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
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
             <button 
                onClick={onClose}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 w-full text-lg"
              >
                Continue
              </button>
              {isCorrect && (
                <button
                  onClick={() => {
                      if (verb) {
                        onRemoveWord(verb);
                      }
                      onClose();
                  }}
                  className="bg-rose-600/90 text-white font-bold py-3 px-6 rounded-md hover:bg-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-400/50 transition-all duration-300 w-full text-lg"
                >
                  Remove Word
                </button>
              )}
          </div>
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
  const [words, setWords] = useState(WHEEL_WORDS);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { playTick, playCorrectSound, playIncorrectSound } = useTickSound();

  const animationState = useRef({
    startRotation: 0,
    targetRotation: 0,
    startTime: 0,
    randomItemIndex: 0,
    animationFrameId: null as number | null,
  });

  const handleRemoveWord = useCallback((wordToRemove: string) => {
    setWords(currentWords => currentWords.filter(w => w !== wordToRemove));
  }, []);

  const handleSpin = useCallback(() => {
    if (isSpinning || words.length === 0) return;

    setSelectedWord(null);

    const totalItems = words.length;
    const randomItemIndex = Math.floor(Math.random() * totalItems);
    const degreesPerItem = 360 / totalItems;
    
    // Add a random "jitter" to the final position to make it feel more natural.
    // This will stop the pointer somewhere within the middle 80% of the segment.
    const randomJitter = (Math.random() - 0.5) * (degreesPerItem * 0.8);

    // Align the pointer (at 270 degrees) with the selected segment's center, including the jitter
    const targetAngle = 270 - (randomItemIndex * degreesPerItem) - randomJitter;
    const fullSpins = 6 + Math.floor(Math.random() * 4);
    
    // Ensure rotation continues from where it left off
    const currentRevolution = Math.floor(rotation / 360);
    const newTargetRotation = (currentRevolution * 360) + (fullSpins * 360) + targetAngle;

    animationState.current = {
      ...animationState.current,
      startRotation: rotation,
      targetRotation: newTargetRotation,
      startTime: Date.now(),
      randomItemIndex: randomItemIndex,
    };
    
    setIsSpinning(true);
  }, [isSpinning, rotation, words]);

  useEffect(() => {
    if (!isSpinning) {
      if (animationState.current.animationFrameId) {
        cancelAnimationFrame(animationState.current.animationFrameId);
        animationState.current.animationFrameId = null;
      }
      return;
    }

    const duration = 6000;
    const segmentAngle = 360 / words.length;
    
    const { startRotation, targetRotation, startTime, randomItemIndex } = animationState.current;
    
    const lastTickRotation = { current: startRotation };

    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const currentRotationValue = startRotation + (targetRotation - startRotation) * easedProgress;
      setRotation(currentRotationValue);

      while (currentRotationValue >= lastTickRotation.current + segmentAngle) {
        playTick();
        lastTickRotation.current += segmentAngle;
      }

      if (progress < 1) {
        animationState.current.animationFrameId = requestAnimationFrame(animate);
      } else {
        setRotation(targetRotation % 360);
        setIsSpinning(false);
        setSelectedWord(words[randomItemIndex]);
        animationState.current.animationFrameId = null;
      }
    };

    animationState.current.animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationState.current.animationFrameId) {
        cancelAnimationFrame(animationState.current.animationFrameId);
      }
    };
  }, [isSpinning, playTick, words]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter' && !selectedWord) {
        event.preventDefault();
        handleSpin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSpin, selectedWord]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="relative w-full max-w-[320px] sm:max-w-[480px] md:max-w-[600px] flex items-center justify-center">
        <div className="absolute top-1/2 left-0 z-20 -translate-y-1/2 -translate-x-1/2">
            <PointerIcon />
        </div>
        <Wheel 
          rotation={rotation} 
          onSpin={handleSpin} 
          isSpinning={isSpinning || words.length === 0}
          words={words}
        />
      </div>

      {words.length === 0 && (
        <div className="mt-8 text-center text-white bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
          <h2 className="text-2xl font-bold">All words learned!</h2>
          <p className="text-gray-300">Refresh the page to start over.</p>
        </div>
      )}

      <VerbQuizModal 
        verb={selectedWord} 
        onClose={() => setSelectedWord(null)}
        onCorrect={playCorrectSound}
        onIncorrect={playIncorrectSound}
        onRemoveWord={handleRemoveWord}
      />
    </div>
  );
}
