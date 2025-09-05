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
    before: string
    after: string
    explanation: string
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
        lineNumbers: testState.sourceLines,
        evaluationResults: testState.evaluationResults,
        conversation: testState.conversation,
        scenarioOverview: testState.scenarioOverview,
        studentProfilePrompt: testState.studentProfilePrompt,
        remediationSuggestion: testState.remediationSuggestion, // Make sure this is included
        analysis: {
          transcriptSummary: testState.transcriptSummary,
          callSuccessful: testState.callSuccessful
        },
        problemOverview: testState.finalResult === 'passed'
          ? `${testState.componentName} test passed successfully`
          : `${testState.componentName} test failed`,
        // Only include suggestedChange if there's remediation
        suggestedChange: testState.remediationSuggestion ? {
          before: testState.remediationSuggestion.before,
          after: testState.remediationSuggestion.after,
          explanation: testState.remediationSuggestion.explanation
        } : testState.finalResult === 'failed' ? {
          before: "Current implementation",
          after: "Suggested improvement based on test failure",
          explanation: `Test failed: ${testState.transcriptSummary || 'No details available'}`
        } : undefined,
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

  const handleAcceptChange = async (change: {
    testId: string
    lineNumbers: number[]
    before: string
    after: string
  }) => {
    if (!agentInfo?.prompt || !onUpdateConfig) return
    
    const promptLines = agentInfo.prompt.split('\n')
    
    // Replace the content at the specified lines
    change.lineNumbers.forEach(lineNum => {
      if (lineNum > 0 && lineNum <= promptLines.length) {
        // Replace the line (lineNum is 1-based, array is 0-based)
        promptLines[lineNum - 1] = change.after
      }
    })
    
    const newPrompt = promptLines.join('\n')
    
    // Update the prompt
    await onUpdateConfig(newPrompt, agentInfo.first_message)
    
    // Update local state to reflect the change
    setPromptData(prev => ({
      ...prev,
      content: promptLines,
      // Remove highlighting from fixed lines
      highlightedLines: prev.highlightedLines.filter(
        line => !change.lineNumbers.includes(line)
      )
    }))

    // Temporarily highlight the changed lines in green
    setPromptData(prev => ({
      ...prev,
      content: newPrompt.split('\n'),
      highlightedLines: prev.highlightedLines.filter(
        line => !change.lineNumbers.includes(line)
      ),
      changedLines: change.lineNumbers // Track recently changed lines
    }))
    
    // Remove the green highlight after 3 seconds
    setTimeout(() => {
      setPromptData(prev => ({
        ...prev,
        changedLines: []
      }))
    }, 3000)
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
                enhancedTestResults={enhancedTestResults}
                onAcceptChange={handleAcceptChange} 
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
              onAcceptChange={handleAcceptChange}
            />
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}