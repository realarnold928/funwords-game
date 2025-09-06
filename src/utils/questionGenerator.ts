import { Word, Question } from '../types';
import { db } from './database';

export class QuestionGenerator {
  private static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static async generateMultipleChoiceQuestion(
    targetWord: Word, 
    allWords: Word[]
  ): Promise<Question> {
    // Get 3 wrong options
    const wrongOptions = allWords
      .filter(w => w.id !== targetWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.meaning);

    const options = this.shuffleArray([targetWord.meaning, ...wrongOptions]);

    return {
      id: Date.now() + Math.random(),
      word: targetWord,
      type: 'multiple-choice',
      options,
      correctAnswer: targetWord.meaning
    };
  }

  static async generateSpellingQuestion(targetWord: Word): Promise<Question> {
    return {
      id: Date.now() + Math.random(),
      word: targetWord,
      type: 'spelling',
      correctAnswer: targetWord.headword.toLowerCase()
    };
  }

  static async generateAudioQuestion(
    targetWord: Word, 
    allWords: Word[]
  ): Promise<Question> {
    // Get 3 wrong options
    const wrongOptions = allWords
      .filter(w => w.id !== targetWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.headword);

    const options = this.shuffleArray([targetWord.headword, ...wrongOptions]);

    return {
      id: Date.now() + Math.random(),
      word: targetWord,
      type: 'audio',
      options,
      correctAnswer: targetWord.headword
    };
  }

  static async generateQuestions(count: number = 10): Promise<Question[]> {
    const allWords = await db.getRandomWords(count + 10); // Get extra words for wrong options
    const targetWords = allWords.slice(0, count);
    const questions: Question[] = [];

    for (const word of targetWords) {
      const questionType = this.getRandomQuestionType();
      
      let question: Question;
      
      switch (questionType) {
        case 'multiple-choice':
          question = await this.generateMultipleChoiceQuestion(word, allWords);
          break;
        case 'spelling':
          question = await this.generateSpellingQuestion(word);
          break;
        case 'audio':
          question = await this.generateAudioQuestion(word, allWords);
          break;
        default:
          question = await this.generateMultipleChoiceQuestion(word, allWords);
      }
      
      questions.push(question);
    }

    return questions;
  }

  private static getRandomQuestionType(): 'multiple-choice' | 'spelling' | 'audio' {
    const types = ['multiple-choice', 'spelling', 'audio'] as const;
    const weights = [0.5, 0.3, 0.2]; // 50% multiple choice, 30% spelling, 20% audio
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return types[i];
      }
    }
    
    return 'multiple-choice'; // fallback
  }

  static checkAnswer(question: Question, userAnswer: string): boolean {
    const normalizedUserAnswer = userAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = question.correctAnswer.toLowerCase().trim();
    
    return normalizedUserAnswer === normalizedCorrectAnswer;
  }

  static getHint(question: Question): string {
    switch (question.type) {
      case 'multiple-choice':
        return `提示：这个词的意思和"${question.correctAnswer.substring(0, 2)}..."相关`;
      case 'spelling':
        return `提示：这个单词以"${question.correctAnswer.substring(0, 2)}"开头`;
      case 'audio':
        return `提示：这个单词以"${question.correctAnswer.substring(0, 1)}"开头，共${question.correctAnswer.length}个字母`;
      default:
        return '提示：仔细思考一下';
    }
  }
}