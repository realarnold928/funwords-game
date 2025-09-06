import { useState, useCallback } from 'react';
import { GameState, Question, GameResult } from '../types';
import { QuestionGenerator } from '../utils/questionGenerator';
import { db } from '../utils/database';

const initialGameState: GameState = {
  lives: 3,
  score: 0,
  combo: 0,
  maxCombo: 0,
  currentQuestionIndex: 0,
  questions: [],
  correctAnswers: 0,
  totalQuestions: 10
};

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoading, setIsLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [hintUsed, setHintUsed] = useState(0);
  const [maxHints] = useState(2);

  const startNewGame = useCallback(async () => {
    setIsLoading(true);
    try {
      const questions = await QuestionGenerator.generateQuestions(10);
      setGameState({
        ...initialGameState,
        questions
      });
      setGameOver(false);
      setGameResult(null);
      setHintUsed(0);
    } catch (error) {
      console.error('Failed to start new game:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const answerQuestion = useCallback(async (answer: string) => {
    if (gameOver) return;
    
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = QuestionGenerator.checkAnswer(currentQuestion, answer);
    
    // Update progress in database
    await db.updateProgress(currentQuestion.word.id, isCorrect);

    setGameState(prevState => {
      const newState = { ...prevState };
      
      if (isCorrect) {
        newState.score += 1;
        newState.combo += 1;
        newState.maxCombo = Math.max(newState.maxCombo, newState.combo);
        newState.correctAnswers += 1;

        // Combo rewards
        if (newState.combo === 5) {
          newState.lives = Math.min(3, newState.lives + 1);
        }
      } else {
        newState.score = Math.max(0, newState.score - 1);
        newState.combo = 0;
        newState.lives -= 1;
      }

      // Check if game should end
      if (newState.lives <= 0 || newState.currentQuestionIndex >= newState.questions.length - 1) {
        // Game over, calculate result
        const correctRate = (newState.correctAnswers / (newState.currentQuestionIndex + 1)) * 100;
        let medal: 'S' | 'A' | 'B' | 'C' = 'C';
        
        if (correctRate >= 90) medal = 'S';
        else if (correctRate >= 80) medal = 'A';
        else if (correctRate >= 70) medal = 'B';

        const result: GameResult = {
          score: newState.score,
          correctRate,
          maxCombo: newState.maxCombo,
          medal
        };

        setGameResult(result);
        setGameOver(true);
        
        // Update high score if necessary
        db.getHighScore().then(highScore => {
          if (newState.score > highScore) {
            db.setHighScore(newState.score);
          }
        });
      } else {
        newState.currentQuestionIndex += 1;
      }

      return newState;
    });
  }, [gameState, gameOver]);

  const useHint = useCallback((): string | null => {
    if (hintUsed >= maxHints) return null;
    
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    if (!currentQuestion) return null;

    setHintUsed(prev => prev + 1);
    return QuestionGenerator.getHint(currentQuestion);
  }, [gameState.currentQuestionIndex, gameState.questions, hintUsed, maxHints]);

  const getCurrentQuestion = useCallback((): Question | null => {
    return gameState.questions[gameState.currentQuestionIndex] || null;
  }, [gameState.questions, gameState.currentQuestionIndex]);

  const skipQuestion = useCallback(() => {
    // Treat skip as wrong answer
    answerQuestion('__skip__');
  }, [answerQuestion]);

  // Speech synthesis for audio questions
  const speakWord = useCallback((word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    gameState,
    isLoading,
    gameOver,
    gameResult,
    hintUsed,
    maxHints,
    startNewGame,
    answerQuestion,
    useHint,
    getCurrentQuestion,
    skipQuestion,
    speakWord
  };
};