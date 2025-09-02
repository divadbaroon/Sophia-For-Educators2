"use client"

import { useState } from "react"

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Card } from "@/components/ui/card"

import { PromptPanel } from "@/components/promptSidePanel/prompt-panel"
import { FeedbackPanel } from "@/components/feedback-panel"

import { mockFeedbackData } from "@/lib/mock-data"

import { ValidationInterfaceProps } from "./types"

export function ValidationInterface({ 
  condition = "1", 
  isRunningTests, 
  currentStep, 
  steps,
  agentInfo,
  isSaving = false,
  onUpdateConfig
}: ValidationInterfaceProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)

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
              feedbackData={mockFeedbackData}
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