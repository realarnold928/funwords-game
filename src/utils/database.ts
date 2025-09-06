import { Word, Progress } from '../types';

const DB_NAME = 'FunWordsDB';
const DB_VERSION = 1;

class DatabaseManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create words store
        if (!db.objectStoreNames.contains('words')) {
          const wordsStore = db.createObjectStore('words', { keyPath: 'id' });
          wordsStore.createIndex('headword', 'headword', { unique: false });
        }

        // Create progress store
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'wordId' });
        }

        // Create meta store
        if (!db.objectStoreNames.contains('meta')) {
          const metaStore = db.createObjectStore('meta', { keyPath: 'key' });
          // Initialize high score
          metaStore.add({ key: 'highScore', value: 0 });
        }
      };
    });
  }

  async addWords(words: Word[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['words'], 'readwrite');
    const store = transaction.objectStore('words');
    
    for (const word of words) {
      await new Promise<void>((resolve, reject) => {
        const request = store.put(word);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getRandomWords(count: number): Promise<Word[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['words'], 'readonly');
    const store = transaction.objectStore('words');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const allWords = request.result;
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        resolve(shuffled.slice(0, count));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateProgress(wordId: number, isCorrect: boolean): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['progress'], 'readwrite');
    const store = transaction.objectStore('progress');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(wordId);
      getRequest.onsuccess = () => {
        const existing = getRequest.result || { wordId, correct: 0, wrong: 0 };
        
        if (isCorrect) {
          existing.correct++;
        } else {
          existing.wrong++;
        }
        
        const putRequest = store.put(existing);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getHighScore(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['meta'], 'readonly');
    const store = transaction.objectStore('meta');
    
    return new Promise((resolve, reject) => {
      const request = store.get('highScore');
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : 0);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async setHighScore(score: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['meta'], 'readwrite');
    const store = transaction.objectStore('meta');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ key: 'highScore', value: score });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getProgress(wordId: number): Promise<Progress | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['progress'], 'readonly');
    const store = transaction.objectStore('progress');
    
    return new Promise((resolve, reject) => {
      const request = store.get(wordId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new DatabaseManager();