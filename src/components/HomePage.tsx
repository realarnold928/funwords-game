import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { db } from '../utils/database';

interface HomePageProps {
  onStartGame: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartGame }) => {
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const score = await db.getHighScore();
        setHighScore(score);
      } catch (error) {
        console.error('Failed to load high score:', error);
      }
    };

    loadHighScore();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="text-center max-w-md mx-auto">
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="py-8">
            <h1 className="font-pixel text-primary text-3xl mb-2 animate-flash">
              FUNWORDS
            </h1>
            <div className="font-pixel text-white text-sm">
              高考趣味背单词
            </div>
            <div className="font-pixel text-gray-400 text-xs mt-2">
              🎮 RETRO STYLE 🎮
            </div>
          </div>

          {/* High Score */}
          <div className="bg-gray-900 border-2 border-gray-600 p-4">
            <div className="font-pixel text-yellow-400 text-sm">
              HIGH SCORE
            </div>
            <div className="font-pixel text-white text-2xl">
              {highScore.toLocaleString()}
            </div>
          </div>

          {/* Game Features */}
          <div className="text-left space-y-2">
            <div className="font-pixel text-white text-xs">
              ✨ 3 QUESTION TYPES
            </div>
            <div className="font-pixel text-white text-xs">
              ❤️ 3 LIVES SYSTEM
            </div>
            <div className="font-pixel text-white text-xs">
              🔥 COMBO REWARDS
            </div>
            <div className="font-pixel text-white text-xs">
              💡 2 HINTS PER GAME
            </div>
          </div>

          {/* Start Button */}
          <Button
            onClick={() => {
              console.log('Start game button clicked');
              onStartGame();
            }}
            size="lg"
            className="w-full text-xl py-4 animate-pulse hover:animate-none"
          >
            START GAME
          </Button>

          {/* Instructions */}
          <div className="text-xs font-pixel text-gray-400 space-y-1">
            <div>• Answer 10 questions correctly</div>
            <div>• Combo x3 = Special effects</div>
            <div>• Combo x5 = Extra life</div>
            <div>• Good luck, student!</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};