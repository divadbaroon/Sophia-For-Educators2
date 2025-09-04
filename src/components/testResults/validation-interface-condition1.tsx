"use client"

import { useState } from "react"
import { PromptPanel } from "@/components/promptSidePanel/prompt-panel-condition1"
import { FeedbackPanel } from "@/components/feedbackPanel/feedback-panel-condition1"
import { mockFeedbackData } from "@/lib/mock-data"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Card } from "@/components/ui/card"
import { AgentInfo } from "@/components/configuration/types"

interface ValidationInterfaceProps {
  isRunningTests?: boolean
  currentStep?: number
  steps?: string[]
  agentInfo?: AgentInfo | null 
  isSaving?: boolean 
  onUpdateConfig?: (prompt: string, firstMessage: string) => Promise<AgentInfo | null> 
}

export function ValidationInterface({ 
  isRunningTests, 
  currentStep, 
  steps,
  agentInfo,
  isSaving = false,
  onUpdateConfig 
}: ValidationInterfaceProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)

  // Transform agent prompt to PromptData format
  const promptData = agentInfo ? {
    title: "System Prompt",
    content: agentInfo.prompt ? agentInfo.prompt.split("\n") : [],
    highlightedLines: [] // You might want to populate this based on test results
  } : {
    title: "System Prompt",
    content: [],
    highlightedLines: []
  }

  const handlePromptSave = async (newPrompt: string) => {
    if (!agentInfo || !onUpdateConfig) return

    // Keep the existing first message when updating prompt
    await onUpdateConfig(newPrompt, agentInfo.first_message)
  }

  return (
    <div className="h-full min-h-[600px] p-4 gap-6 flex">
      <ResizablePanelGroup direction="horizontal" className="h-full bg-background">
        {/* Left Panel - Prompt Display */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <Card className="h-full min-h-[550px] border border-border">
            {agentInfo ? (
              <PromptPanel
                promptData={promptData}
                selectedLine={selectedLine}
                onLineSelect={setSelectedLine}
                isRunningTests={isRunningTests}
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
          <Card className="h-full min-h-[550px] border border-border">
            <FeedbackPanel
              feedbackData={mockFeedbackData}
              selectedLine={selectedLine}
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