export interface Word {
  id: number;
  headword: string;
  meaning: string;
  example?: string;
  audioKey?: string;
}

export interface Progress {
  wordId: number;
  correct: number;
  wrong: number;
}

export interface Meta {
  highScore: number;
}

export interface GameState {
  lives: number;
  score: number;
  combo: number;
  maxCombo: number;
  currentQuestionIndex: number;
  questions: Question[];
  correctAnswers: number;
  totalQuestions: number;
}

export interface Question {
  id: number;
  word: Word;
  type: 'multiple-choice' | 'spelling' | 'audio';
  options?: string[];
  correctAnswer: string;
}

export interface GameResult {
  score: number;
  correctRate: number;
  maxCombo: number;
  medal: 'S' | 'A' | 'B' | 'C';
}