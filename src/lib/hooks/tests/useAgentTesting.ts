import { useState } from 'react';
import {
  addSavedTest,
  setLastCreatedTestId,
  updateSavedTest,
  type SavedTest,
} from '@/lib/storage/tests'; 

interface TestData {
  testName: string;
  successCriteria: string;
  successExamples: Array<{ id: string; text: string }>;
  failureExamples: Array<{ id: string; text: string }>;
  chatMessages: Array<{ id: string; type: 'user' | 'agent'; text: string }>;
  dynamicVariables?: Record<string, any>;
  toolCallParameters?: Record<string, any>;
}


interface UpdatedTest {
  id: string;
}

interface CreatedTest { id: string; }

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
      if (!response.ok) throw new Error(data?.error || 'Failed to create test');

      // ✅ Persist locally
      const saved: SavedTest = {
        id: data.id, // ElevenLabs ID
        title: testData.testName,
        description: testData.successCriteria.slice(0, 140) + '…',
        createdAt: new Date().toISOString(),
      };
      addSavedTest(saved);
      setLastCreatedTestId(data.id);

      return data as CreatedTest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test');
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

export function useUpdateTest() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTest = async (testId: string, testData: TestData): Promise<UpdatedTest | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      console.log('🔄 Updating test:', testId);

      const response = await fetch(`/api/elevenlabs/update-test/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update test');
      }

      // Update local storage with new data
      const updatedSavedTest: SavedTest = {
        id: testId,
        title: testData.testName,
        description: testData.successCriteria.slice(0, 140) + '…',
        createdAt: new Date().toISOString(), // Updated timestamp
      };

      updateSavedTest(updatedSavedTest);

      console.log('✅ Test updated successfully:', testId);
      
      return { id: testId } as UpdatedTest;
    } catch (err) {
      console.error('❌ Error updating test:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update test';
      setError(errorMessage);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateTest, isUpdating, error };
}