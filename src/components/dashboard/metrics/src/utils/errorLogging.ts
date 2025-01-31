// src/utils/errorLogging.ts
export const logError = (error: unknown, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    // Add your error reporting service here if needed
  };
  