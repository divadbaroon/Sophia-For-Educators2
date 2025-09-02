export interface TestData {
  testName: string;
  successCriteria: string;
  successExamples: Array<{ id: string; text: string }>;
  failureExamples: Array<{ id: string; text: string }>;
  chatMessages: Array<{ id: string; type: 'user' | 'agent'; text: string }>;
  dynamicVariables?: Record<string, any>;
  toolCallParameters?: Record<string, any>;
}

export interface CreatedTest {
  id: string;
}