import React from 'react';
import { GameState } from '../types';

interface GameHeaderProps {
  gameState: GameState;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ gameState }) => {
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < 3; i++) {
      hearts.push(
        <span
          key={i}
          className={`text-2xl ${
            i < gameState.lives ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          ❤️
        </span>
      );
    }
    return hearts;
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-900 border-b-2 border-primary">
      {/* Lives */}
      <div className="flex items-center gap-2">
        <span className="font-pixel text-white text-sm">LIVES</span>
        <div className="flex gap-1">{renderHearts()}</div>
      </div>

      {/* Score and Combo */}
      <div className="text-center">
        <div className="font-pixel text-primary text-xl">
          SCORE: {gameState.score}
        </div>
        {gameState.combo > 0 && (
          <div className="font-pixel text-yellow-400 text-sm animate-flash">
            COMBO x{gameState.combo}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="text-right">
        <div className="font-pixel text-white text-sm">
          {gameState.currentQuestionIndex + 1} / {gameState.totalQuestions}
        </div>
        {gameState.combo >= 3 && (
          <div className="font-pixel text-yellow-400 text-xs">
            {gameState.combo >= 5 ? '🌟 LIFE BONUS!' : '⭐ COMBO!'}
          </div>
        )}
      </div>
    </div>
  );
};