"use client"

import { useState, useEffect } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Card } from "@/components/ui/card"
import { FeedbackPanelCondition1 } from "@/components/feedbackPanel/feedback-panel-condition1"
import { PromptPanelCondition1 } from "@/components/promptSidePanel/prompt-panel-condition1"
import { ValidationInterfaceCondition1Props } from "./types"
import { FeedbackItem, FeedbackData } from "@/types"

interface PromptData {
  title: string
  content: string[]
  highlightedLines: number[]
}

// Enhanced test state interface
export interface TestState {
  testId: string
  testName: string
  componentName: string
  evaluationResults: Record<string, {
    criteriaId: string
    result: 'success' | 'failure'
    rationale: string
  }>
  sourceLines: number[]
  selectedProfileId: string
  selectedScenarioId: string
  scenarioOverview: string
  studentProfilePrompt: string
  conversation: Array<{
    role: 'agent' | 'user'
    message: string
    timeInCallSecs?: number
    multivoice_message?: any
    toolCalls?: any[]
    toolResults?: any[]
    interrupted?: boolean
  }>
  finalResult: 'passed' | 'failed'
  transcriptSummary?: string
  callSuccessful?: string
  remediationSuggestion?: {
    analysis: {
      pedagogicalGap: string
      rootCause: string
      targetedFix: string
    }
    suggestions: Array<{
      changeType: 'replace' | 'add' | 'modify' | 'restructure'
      affectedLines: number[]
      originalContent: string
      suggestedContent: string
      rationale: string
      pedagogicalPrinciple: string
    }>
  }
}

interface TestResult {
  testId: string
  componentName: string
  success: boolean
  evaluationResults?: Record<string, any>
  analysis?: {
    evaluationCriteriaResults?: Record<string, any>
    callSuccessful?: string
    transcriptSummary?: string
  }
  conversation?: Array<{
    role: 'agent' | 'user'
    message: string
    timeInCallSecs?: number
    multivoice_message?: any
    toolCalls?: any[]
    toolResults?: any[]
    interrupted?: boolean
  }>
}

export function ValidationInterfaceCondition1({ 
  isRunningTests, 
  currentStep, 
  steps,
  agentInfo,
  isSaving = false,
  onUpdateConfig,
  testResults = [],
  enhancedTestResults = [], 
}: ValidationInterfaceCondition1Props & { 
  testResults?: TestResult[]
  enhancedTestResults?: TestState[] 
}) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [promptData, setPromptData] = useState<PromptData>({
    title: "System Prompt",
    content: [],
    highlightedLines: []
  })
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    summary: { total: 0, passed: 0, errors: 0, warnings: 0 },
    items: []
  })

  // Convert enhanced test results to feedback data
  useEffect(() => {
    if (enhancedTestResults && enhancedTestResults.length > 0) {
      const passed = enhancedTestResults.filter(test => test.finalResult === 'passed').length
      const failed = enhancedTestResults.filter(test => test.finalResult === 'failed').length
      
      const items: FeedbackItem[] = enhancedTestResults.map((testState) => ({
        id: testState.testId,
        title: testState.testName,
        description: testState.transcriptSummary || `Test for ${testState.componentName}`,
        severity: testState.finalResult === 'passed' ? 'success' : 'error' as const,
        lineNumbers: testState.sourceLines, // Now uses actual source lines!
        evaluationResults: testState.evaluationResults,
        conversation: testState.conversation,
        scenarioOverview: testState.scenarioOverview,
        studentProfilePrompt: testState.studentProfilePrompt,
        remediationSuggestion: testState.remediationSuggestion, 
        analysis: {
          transcriptSummary: testState.transcriptSummary,
          callSuccessful: testState.callSuccessful
        },
        problemOverview: testState.finalResult === 'passed'
          ? `${testState.componentName} test passed successfully`
          : `${testState.componentName} test failed`,
        suggestedChange: testState.finalResult === 'passed' ? undefined : {
          before: "Current implementation",
          after: "Suggested improvement based on test failure",
          explanation: `Test failed: ${testState.transcriptSummary || 'No details available'}`
        },
        evidence: testState.finalResult === 'passed'
          ? "Test case passed successfully"
          : `Test case failed: ${testState.transcriptSummary || 'No details available'}`,
        recommendation: testState.finalResult === 'passed'
          ? "Continue with current approach - this component is working well"
          : `Review and improve ${testState.componentName} implementation based on test failure`,
        exampleVideos: []
      }))

      setFeedbackData({
        summary: { 
          total: enhancedTestResults.length, 
          passed, 
          errors: failed, 
          warnings: 0 
        },
        items
      })
    } else {
      setFeedbackData({
        summary: { total: 0, passed: 0, errors: 0, warnings: 0 },
        items: []
      })
    }
  }, [enhancedTestResults])

  // Update promptData when agentInfo changes - now uses actual source lines
  useEffect(() => {
    if (agentInfo?.prompt && enhancedTestResults && enhancedTestResults.length > 0) {
      const highlightedLines: number[] = []
      
      // Add source lines for failed tests
      enhancedTestResults.forEach(testState => {
        if (testState.finalResult === 'failed') {
          highlightedLines.push(...testState.sourceLines)
        }
      })

      // Remove duplicates
      const uniqueHighlightedLines = [...new Set(highlightedLines)]

      setPromptData({
        title: "System Prompt",
        content: agentInfo.prompt.split("\n"),
        highlightedLines: uniqueHighlightedLines
      })
    } else if (agentInfo?.prompt) {
      setPromptData({
        title: "System Prompt",
        content: agentInfo.prompt.split("\n"),
        highlightedLines: []
      })
    }
  }, [agentInfo?.prompt, enhancedTestResults])

  const handlePromptSave = async (newPrompt: string) => {
    if (!agentInfo || !onUpdateConfig) return
    await onUpdateConfig(newPrompt, agentInfo.first_message)
  }

  return (
    <div className="h-full min-h-[600px] p-2 gap-6 flex -mt-2">
      <ResizablePanelGroup direction="horizontal" className="h-full bg-background">
        <ResizablePanel defaultSize={50} minSize={30}>
          <Card className="h-full min-h-[550px] border border-border">
            {agentInfo ? (
              <PromptPanelCondition1
                promptData={promptData}
                selectedLine={selectedLine}
                onLineSelect={setSelectedLine}
                isRunningTests={isRunningTests}
                onPromptSave={handlePromptSave}
                isSaving={isSaving}
                testResults={testResults}
                enhancedTestResults={enhancedTestResults} // Pass enhanced results
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No agent data available</p>
              </div>
            )}
          </Card>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <Card className="h-full min-h-[550px] border border-border">
            <FeedbackPanelCondition1
              feedbackData={feedbackData}
              selectedLine={selectedLine}
              onClearSelection={() => setSelectedLine(null)}
              isRunningTests={isRunningTests}
              currentStep={currentStep}
              steps={steps}
              promptData={promptData} 
            />
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}