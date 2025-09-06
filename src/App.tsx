import React, { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { GameHeader } from './components/GameHeader';
import { QuestionCard } from './components/QuestionCard';
import { GameResult } from './components/GameResult';
import { useGame } from './hooks/useGame';
import { initializeDatabase } from './utils/initData';
import { soundEffects } from './utils/soundEffects';

type AppState = 'home' | 'playing' | 'result';

function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [dbInitialized, setDbInitialized] = useState(false);
  const [shakeEffect, setShakeEffect] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);

  const {
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
    speakWord
  } = useGame();

  // Initialize database on app start
  useEffect(() => {
    const initDb = async () => {
      try {
        console.log('Initializing database...');
        await initializeDatabase();
        console.log('Database initialized successfully');
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Still allow the app to run even if database fails
        setDbInitialized(true);
      }
    };
    
    initDb();
  }, []);

  // Handle game state changes
  useEffect(() => {
    if (gameOver && gameResult) {
      setAppState('result');
      // Play appropriate end game sound
      if (gameResult.medal === 'S' || gameResult.medal === 'A') {
        soundEffects.victory();
      } else {
        soundEffects.gameOver();
      }
    }
  }, [gameOver, gameResult]);

  // Handle answer with visual and audio feedback
  const handleAnswer = async (answer: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    // Add visual feedback based on answer correctness
    const isCorrect = currentQuestion.correctAnswer.toLowerCase() === answer.toLowerCase();
    
    if (isCorrect) {
      setFlashEffect(true);
      setTimeout(() => setFlashEffect(false), 300);
      soundEffects.correctAnswer();
      
      // Check for combo achievements
      if (gameState.combo + 1 === 3) {
        setTimeout(() => soundEffects.comboAchievement(), 500);
      }
      if (gameState.combo + 1 === 5) {
        setTimeout(() => soundEffects.lifeGained(), 800);
      }
    } else {
      setShakeEffect(true);
      setTimeout(() => setShakeEffect(false), 500);
      soundEffects.wrongAnswer();
    }

    await answerQuestion(answer);
  };

  const handleStartGame = async () => {
    console.log('handleStartGame called, dbInitialized:', dbInitialized);
    if (!dbInitialized) {
      console.log('Database not initialized, returning');
      return;
    }
    
    console.log('Starting new game...');
    soundEffects.resume(); // Ensure audio context is active
    soundEffects.buttonClick();
    setAppState('playing');
    await startNewGame();
    console.log('Game started!');
  };

  const handlePlayAgain = async () => {
    setAppState('playing');
    await startNewGame();
  };

  const handleGoHome = () => {
    setAppState('home');
  };

  if (!dbInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-pixel text-primary text-xl animate-pulse">
          LOADING VOCABULARY...
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();

  return (
    <div className={`min-h-screen ${
      shakeEffect ? 'animate-shake' : ''
    } ${flashEffect ? 'animate-flash' : ''}`}>
      {appState === 'home' && (
        <HomePage onStartGame={handleStartGame} />
      )}

      {appState === 'playing' && (
        <>
          <GameHeader gameState={gameState} />
          
          <div className="container mx-auto px-4 py-8">
            {isLoading ? (
              <div className="text-center">
                <div className="font-pixel text-primary text-xl animate-pulse">
                  GENERATING QUESTIONS...
                </div>
              </div>
            ) : currentQuestion ? (
              <QuestionCard
                question={currentQuestion}
                onAnswer={handleAnswer}
                onHint={useHint}
                onSpeak={speakWord}
                hintUsed={hintUsed}
                maxHints={maxHints}
              />
            ) : (
              <div className="text-center">
                <div className="font-pixel text-error text-xl">
                  NO QUESTIONS AVAILABLE
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {appState === 'result' && gameResult && (
        <GameResult
          result={gameResult}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
}

export default App;
