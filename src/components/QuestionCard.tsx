import React, { useState } from 'react';
import { Question } from '../types';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  onHint: () => string | null;
  onSpeak?: (word: string) => void;
  hintUsed: number;
  maxHints: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  onHint,
  onSpeak,
  hintUsed,
  maxHints
}) => {
  const [userInput, setUserInput] = useState('');
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleHint = () => {
    const hint = onHint();
    if (hint) {
      setCurrentHint(hint);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000); // Hide hint after 3 seconds
    }
  };

  const handleSpellingSubmit = () => {
    if (userInput.trim()) {
      onAnswer(userInput.trim());
      setUserInput('');
    }
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-pixel text-white text-xl mb-2">
                What does this word mean?
              </h2>
              <div className="font-pixel text-primary text-2xl mb-6">
                {question.word.headword.toUpperCase()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {question.options?.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => onAnswer(option)}
                  variant="secondary"
                  className="text-left p-4 hover:bg-primary hover:text-black transition-colors"
                >
                  {String.fromCharCode(65 + index)}. {option}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'spelling':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-pixel text-white text-xl mb-2">
                Spell the word
              </h2>
              <div className="font-pixel text-primary text-lg mb-6">
                {question.word.meaning}
              </div>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSpellingSubmit()}
                className="w-full p-3 font-pixel bg-gray-700 border-2 border-gray-600 text-white text-center text-xl focus:border-primary focus:outline-none"
                placeholder="Type your answer..."
              />
              
              <Button
                onClick={handleSpellingSubmit}
                disabled={!userInput.trim()}
                className="w-full"
              >
                SUBMIT
              </Button>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="font-pixel text-white text-xl mb-2">
                Listen and choose the correct word
              </h2>
              <Button
                onClick={() => onSpeak?.(question.word.headword)}
                variant="secondary"
                className="mb-6 text-4xl p-4"
              >
                🔊
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {question.options?.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => onAnswer(option)}
                  variant="secondary"
                  className="p-3 hover:bg-primary hover:text-black transition-colors"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="font-pixel text-primary text-sm">
            QUESTION {question.type.toUpperCase()}
          </div>
          <Button
            onClick={handleHint}
            disabled={hintUsed >= maxHints}
            variant="secondary"
            size="sm"
          >
            HINT ({maxHints - hintUsed} left)
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {renderQuestion()}
        
        {/* Hint display */}
        {showHint && currentHint && (
          <div className="mt-4 p-3 bg-yellow-900 border-2 border-yellow-600 animate-flash">
            <div className="font-pixel text-yellow-200 text-sm">
              💡 {currentHint}
            </div>
          </div>
        )}

        {/* Example sentence */}
        {question.word.example && (
          <div className="mt-4 p-3 bg-gray-700 border border-gray-600">
            <div className="font-pixel text-gray-300 text-xs">
              EXAMPLE: {question.word.example}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};