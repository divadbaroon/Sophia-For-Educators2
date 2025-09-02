"use client"

import { useState, useEffect } from "react"

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Card } from "@/components/ui/card"

import { PromptPanel } from "@/components/promptSidePanel/prompt-panel"
import { FeedbackPanel } from "@/components/feedback-panel"

import { loadSavedTests } from "@/lib/storage/tests"

import { ValidationInterfaceProps } from "./types"

// Transform ElevenLabs test results to our FeedbackData format
const transformTestResultsToFeedbackData = (testResults: any) => {
  if (!testResults || !testResults.test_runs) {
    return {
      summary: { total: 0, errors: 0, warnings: 0, passed: 0 },
      items: []
    };
  }

  const items = testResults.test_runs.map((testRun: any, index: number) => {
    const isSuccess = testRun.condition_result?.result === 'success';
    const testName = testRun.metadata?.test_name || `Test ${index + 1}`;
    
    // Extract conversation messages from agent_responses
    const conversation = testRun.agent_responses || [];
    console.log(`🔍 Test "${testName}" conversation length:`, conversation.length);
    console.log(`🔍 Test "${testName}" conversation data:`, conversation);
    
    let conversationSummary = '';
    if (conversation.length > 0) {
      conversationSummary = conversation
        .map((response: any) => `${response.role}: ${response.message}`)
        .join('\n');
    }
    
    const item = {
      id: testRun.test_run_id || `test-${index}`,
      severity: isSuccess ? 'success' as const : 'error' as const,
      title: testName,
      description: isSuccess 
        ? testRun.condition_result?.rationale?.summary || 'Test passed - agent response met the success criteria'
        : testRun.condition_result?.rationale?.summary || 'Test failed - agent response did not meet the success criteria',
      evidence: testRun.condition_result?.rationale?.messages?.join('\n') || conversationSummary,
      recommendation: isSuccess 
        ? 'Great! This test case is working as expected. The agent provided an appropriate response.' 
        : 'Consider reviewing the agent response and adjusting the prompt or configuration to better align with the test criteria.',
      problemOverview: testRun.condition_result?.rationale?.summary || 
        (isSuccess ? 'Test completed successfully' : 'Test did not meet the defined success criteria'),
      // Store the full conversation data for display
      conversation: conversation,
      // Add test metadata for reference
      testMetadata: {
        testId: testRun.test_id,
        status: testRun.status,
        runId: testRun.test_run_id,
        lastUpdated: testRun.last_updated_at_unix
      }
    };
    
    console.log(`🔍 Transformed item for "${testName}":`, item);
    return item;
  });

  console.log('🔍 All transformed items:', items);
  
  // Calculate summary stats
  const total = items.length;
  const passed = items.filter((item: any) => item.severity === 'success').length;
  const failed = total - passed;

  return {
    summary: { total, errors: failed, warnings: 0, passed },
    items
  };
};

export function ValidationInterface({ 
  condition = "1", 
  isRunningTests, 
  currentStep, 
  steps,
  agentInfo,
  isSaving = false,
  onUpdateConfig,
  testResults
}: ValidationInterfaceProps & { testResults?: any }) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [feedbackData, setFeedbackData] = useState(() => ({
    summary: { total: 0, errors: 0, warnings: 0, passed: 0 },
    items: []
  }))

  // Update feedback data when test results change
  useEffect(() => {
  if (testResults) {
    console.log('🔍 Raw test results received:', testResults);
    console.log('🔍 Test runs array:', testResults.test_runs);
    
    // Log each test run's agent_responses
    testResults.test_runs?.forEach((testRun: any, index: number) => {
      console.log(`🔍 Test run ${index} agent_responses:`, testRun.agent_responses);
    });
    
    const transformedData = transformTestResultsToFeedbackData(testResults);
    console.log('🔍 Transformed feedback data:', transformedData);
    setFeedbackData(transformedData);
  }
}, [testResults]);

  const handlePromptSave = async (newPrompt: string) => {
    if (!agentInfo || !onUpdateConfig) return;
    
    await onUpdateConfig(
      agentInfo.name,
      newPrompt,
      agentInfo.first_message
    );
  };

  return (
    <div className="h-full w-full p-0 gap-4 flex">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full bg-background">
        {/* Left Panel - Prompt Display */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <Card className="h-full border border-border">
            {agentInfo ? (
              <PromptPanel
                promptData={{
                  content: agentInfo.prompt ? agentInfo.prompt.split('\n') : []
                }}
                onPromptSave={handlePromptSave}
                isSaving={isSaving}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No agent data available</p>
              </div>
            )}
          </Card>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Feedback Display */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <Card className="h-full border border-border">
            <FeedbackPanel
              feedbackData={feedbackData}
              selectedLine={selectedLine}
              condition={condition}
              onClearSelection={() => setSelectedLine(null)}
              isRunningTests={isRunningTests}
              currentStep={currentStep}
              steps={steps}
            />
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}