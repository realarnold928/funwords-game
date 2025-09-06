import { db } from './database';
import { sampleVocabulary } from '../data/vocabulary';

export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.init();
    
    // Check if words are already loaded
    const existingWords = await db.getRandomWords(1);
    if (existingWords.length === 0) {
      await db.addWords(sampleVocabulary);
      console.log('Vocabulary data initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};