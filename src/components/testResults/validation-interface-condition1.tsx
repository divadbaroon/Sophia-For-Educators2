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
  testResults = []
}: ValidationInterfaceCondition1Props & { testResults?: TestResult[] }) {
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

  // Convert test results to feedback data
  useEffect(() => {
    if (testResults && testResults.length > 0) {
      const passed = testResults.filter(test => test.success).length
      const failed = testResults.filter(test => !test.success).length
      
      const items: FeedbackItem[] = testResults.map((test) => ({
        id: test.testId,
        title: test.componentName,
        description: test.analysis?.transcriptSummary || `Test for ${test.componentName}`,
        severity: test.success ? 'success' : 'error' as const,
        lineNumbers: [],
        evaluationResults: test.evaluationResults || test.analysis?.evaluationCriteriaResults,
        conversation: test.conversation, 
        analysis: test.analysis, 
        problemOverview: test.success 
          ? `${test.componentName} test passed successfully`
          : `${test.componentName} test failed`,
        suggestedChange: test.success ? undefined : {
          before: "Current implementation",
          after: "Suggested improvement based on test failure",
          explanation: `Test failed: ${test.analysis?.transcriptSummary || 'No details available'}`
        },
        evidence: test.success 
          ? "Test case passed successfully"
          : `Test case failed: ${test.analysis?.transcriptSummary || 'No details available'}`,
        recommendation: test.success 
          ? "Continue with current approach - this component is working well"
          : `Review and improve ${test.componentName} implementation based on test failure`,
        exampleVideos: []
      }))

      setFeedbackData({
        summary: { 
          total: testResults.length, 
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
  }, [testResults])

  // Update promptData when agentInfo changes
  useEffect(() => {
    if (agentInfo?.prompt) {
      const failedTests = testResults?.filter(test => !test.success) || []
      const passedTests = testResults?.filter(test => test.success) || []
      
      const highlightedLines: number[] = []
      if (failedTests.length > 0) {
        highlightedLines.push(5, 8, 12)
      }
      if (passedTests.length > 0) {
        highlightedLines.push(2, 15, 20)
      }

      setPromptData({
        title: "System Prompt",
        content: agentInfo.prompt.split("\n"),
        highlightedLines
      })
    } else {
      setPromptData({
        title: "System Prompt",
        content: [],
        highlightedLines: []
      })
    }
  }, [agentInfo?.prompt, testResults])

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