import React, { useEffect, useState } from 'react';
import { GameResult as GameResultType } from '../types';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';

interface GameResultProps {
  result: GameResultType;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameResult: React.FC<GameResultProps> = ({
  result,
  onPlayAgain,
  onGoHome
}) => {
  const [showMedal, setShowMedal] = useState(false);

  useEffect(() => {
    // Animate medal appearance
    const timer = setTimeout(() => setShowMedal(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const getMedalEmoji = (medal: string) => {
    switch (medal) {
      case 'S': return '🏆';
      case 'A': return '🥇';
      case 'B': return '🥈';
      case 'C': return '🥉';
      default: return '🏅';
    }
  };

  const getMedalColor = (medal: string) => {
    switch (medal) {
      case 'S': return 'text-yellow-300';
      case 'A': return 'text-yellow-400';
      case 'B': return 'text-gray-300';
      case 'C': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getMedalMessage = (medal: string) => {
    switch (medal) {
      case 'S': return 'PERFECT! YOU\'RE A VOCABULARY MASTER!';
      case 'A': return 'EXCELLENT! OUTSTANDING PERFORMANCE!';
      case 'B': return 'GOOD JOB! KEEP UP THE GOOD WORK!';
      case 'C': return 'NOT BAD! PRACTICE MAKES PERFECT!';
      default: return 'GAME OVER!';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="text-center max-w-md mx-auto">
        <CardHeader>
          <div className="font-pixel text-primary text-2xl">
            GAME COMPLETE
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Medal Animation */}
          <div className="py-4">
            <div
              className={`text-8xl transition-all duration-1000 ${
                showMedal ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
              }`}
            >
              {getMedalEmoji(result.medal)}
            </div>
            <div className={`font-pixel text-2xl mt-2 ${getMedalColor(result.medal)}`}>
              RANK {result.medal}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-gray-900 border-2 border-gray-600 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-pixel text-white text-sm">FINAL SCORE:</span>
                <span className="font-pixel text-primary text-sm">{result.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-pixel text-white text-sm">ACCURACY:</span>
                <span className="font-pixel text-primary text-sm">{result.correctRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-pixel text-white text-sm">MAX COMBO:</span>
                <span className="font-pixel text-primary text-sm">x{result.maxCombo}</span>
              </div>
            </div>

            {/* Medal Message */}
            <div className="bg-primary p-3 border-2 border-primary">
              <div className="font-pixel text-black text-xs">
                {getMedalMessage(result.medal)}
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="text-left space-y-1">
              {result.correctRate >= 90 && (
                <div className="font-pixel text-yellow-300 text-xs">
                  🌟 VOCABULARY MASTER
                </div>
              )}
              {result.maxCombo >= 5 && (
                <div className="font-pixel text-orange-400 text-xs">
                  🔥 COMBO EXPERT
                </div>
              )}
              {result.score >= 8 && (
                <div className="font-pixel text-green-400 text-xs">
                  📚 SCHOLAR
                </div>
              )}
              {result.correctRate < 60 && (
                <div className="font-pixel text-gray-400 text-xs">
                  💪 KEEP PRACTICING
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button
            onClick={onPlayAgain}
            size="lg"
            className="w-full animate-pulse hover:animate-none"
          >
            PLAY AGAIN
          </Button>
          <Button
            onClick={onGoHome}
            variant="secondary"
            className="w-full"
          >
            BACK TO HOME
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};