import { useState } from 'react';
import {
  addSavedTest,
  setLastCreatedTestId,
  updateSavedTest,
  type SavedTest,
  // If you exported AgentResponse from storage, uncomment this and delete the local type below:
  // type AgentResponse,
} from '@/lib/storage/tests';

/** Local copy of AgentResponse shape (kept minimal for storage).
 * If you already export this from storage/tests, import it instead and remove this.
 */
type AgentResponse = {
  role: 'user' | 'agent' | 'tool';
  message?: string | null;
  original_message?: string | null;
  time_in_call_secs?: number | null;
  source_medium?: string | null;
  tool_calls?: any[] | null;
  tool_results?: any[] | null;
  feedback?: { score?: string; time_in_call_secs?: number } | null;
  llm_override?: string | null;
  conversation_turn_metrics?: any | null;
  rag_retrieval_info?: {
    chunks?: Array<{ document_id?: string; chunk_id?: string; vector_distance?: number }>;
    embedding_model?: string;
    retrieval_query?: string;
    rag_latency_secs?: number;
  } | null;
  interrupted?: boolean;
  llm_usage?: any | null;
};

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

/** Map modal chatMessages -> SavedTest.conversation turns (AgentResponse[])
 * Note: ElevenLabs uses role: 'user' | 'agent' (not 'assistant').
 */
function mapChatMessagesToConversation(
  chatMessages: Array<{ type: 'user' | 'agent'; text: string }> | undefined
): AgentResponse[] {
  const msgs = Array.isArray(chatMessages) ? chatMessages : [];
  return msgs.map<AgentResponse>((m) => {
    const role: AgentResponse['role'] = m.type === 'user' ? 'user' : 'agent';
    return { role, message: m.text ?? '' };
  });
}

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

      // ✅ Persist locally (now with conversation history)
      const saved: SavedTest = {
        id: data.id, // ElevenLabs ID
        title: testData.testName,
        description: testData.successCriteria.slice(0, 140) + '…',
        createdAt: new Date().toISOString(),
        conversation: mapChatMessagesToConversation(testData.chatMessages),
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

      // ✅ Update local storage (now also persist conversation)
      const updatedSavedTest: SavedTest = {
        id: testId,
        title: testData.testName,
        description: testData.successCriteria.slice(0, 140) + '…',
        createdAt: new Date().toISOString(), // Updated timestamp
        conversation: mapChatMessagesToConversation(testData.chatMessages),
      };

      // Works with both full-replace and partial-merge versions of updateSavedTest
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

interface RunTestsData {
  agentId: string;
  testIds: string[];
  agentConfigOverride?: {
    name?: string;
    prompt?: string;
    first_message?: string;
  };
}

interface TestRunResponse {
  id: string;
  test_runs: Array<{
    test_run_id: string;
    test_invocation_id: string;
    agent_id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    test_id: string;
    agent_responses: any[];
    condition_result: {
      result: 'success' | 'failure';
      rationale: {
        messages: string[];
        summary: string;
      };
    };
    last_updated_at_unix: number;
    metadata: {
      workspace_id: string;
      test_name: string;
      ran_by_user_email: string;
      test_type: string;
    };
  }>;
  created_at: number;
}

// IMPORTANT: role should be 'agent' not 'assistant' to align with ElevenLabs data
type RunAgentResponse = {
  role: 'user' | 'agent' | 'tool';
  message?: string;
  time_in_call_secs?: number;
  tool_calls?: any[];
  tool_results?: any[];
};

type TestRun = {
  test_run_id: string;
  status: 'pending' | 'passed' | 'failed'; // per docs after resolution
  agent_responses: RunAgentResponse[] | null;
  last_updated_at_unix?: number | null;
};

type TestInvocation = {
  id: string;
  test_runs: TestRun[];
  created_at?: number | null;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function allTerminal(runs: TestRun[]) {
  // Terminal states per docs are "passed" or "failed"
  return runs.length > 0 && runs.every((r) => r.status !== 'pending');
}

export function useRunTests() {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async (runData: { agentId: string; testIds: string[] }): Promise<TestInvocation | null> => {
    setIsRunning(true);
    setError(null);

    try {
      console.log('🚀 Starting test run...');

      // 1) Start the run
      const startRes = await fetch('/api/elevenlabs/run-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runData),
      });
      if (!startRes.ok) {
        const e = await startRes.json().catch(() => ({}));
        throw new Error(e.error || `Failed to initiate test run (${startRes.status})`);
      }
      const startData = await startRes.json();
      const invocationId: string = startData.invocationId ?? startData.id;
      if (!invocationId) throw new Error('No invocation id returned from run-tests');
      console.log(`✅ Test run initiated: ${invocationId}`);

      // 2) Poll for completion (exponential backoff-ish)
      const started = Date.now();
      const timeoutMs = 120_000; // 2 minutes
      let attempt = 0;

      while (Date.now() - started < timeoutMs) {
        attempt += 1;
        const res = await fetch(`/api/elevenlabs/test-invocations/${invocationId}`, { cache: 'no-store' });
        if (!res.ok) {
          console.warn(`❓ Poll attempt ${attempt} failed: ${res.status}`);
        } else {
          const last = (await res.json()) as TestInvocation;

          const runs = last.test_runs ?? [];
          console.log(
            `🔍 Poll ${attempt}:`,
            runs.map((r) => ({
              id: r.test_run_id,
              status: r.status,
              responses: Array.isArray(r.agent_responses) ? r.agent_responses.length : null,
            }))
          );

          if (allTerminal(runs)) {
            console.log('✅ All runs terminal; returning results');
            return last;
          }
        }

        // backoff: 1s, 1.5s, 2s, ... capped at 3s
        const wait = Math.min(1000 + attempt * 500, 3000);
        await sleep(wait);
      }

      throw new Error('Tests did not complete in the allocated time');
    } catch (e) {
      console.error('❌ Error running tests:', e);
      setError(e instanceof Error ? e.message : 'Failed to run tests');
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  return { runTests, isRunning, error };
}
