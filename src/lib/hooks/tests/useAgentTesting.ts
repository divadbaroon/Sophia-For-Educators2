import { useState } from 'react';

import { TestData, CreatedTest } from './types'

export function useCreateTest() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTest = async (testData: TestData): Promise<CreatedTest | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/elevenlabs/create-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create test');
      }

      return data as CreatedTest;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create test';
      setError(msg);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createTest, isCreating, error };
}

export function useFetchTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTest = async (testId: string): Promise<any | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching test:', testId);

      const response = await fetch(`/api/elevenlabs/get-test/${testId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch test');
      }

      const testData = await response.json();
      console.log('✅ Test fetched successfully');
      return testData;
    } catch (error) {
      console.error('❌ Error fetching test:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch test';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchTest,
    isLoading,
    error
  };
}