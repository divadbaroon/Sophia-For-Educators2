"use client"

import { useState } from "react"
import { PromptPanel } from "@/components/promptSidePanel/prompt-panel-condition1"
import { FeedbackPanel } from "@/components/feedbackPanel/feedback-panel-condition1"
import { mockPromptData, mockFeedbackData } from "@/lib/mock-data"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Card } from "@/components/ui/card"

interface ValidationInterfaceProps {
  condition?: "1" | "2"
  isRunningTests?: boolean
  currentStep?: number
  steps?: string[] // Added steps prop to allow different progress steps for different conditions
}

export function ValidationInterface({ condition = "1", isRunningTests, currentStep, steps }: ValidationInterfaceProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)

  return (
    <div className="h-full min-h-[600px] p-4 gap-6 flex">
      <ResizablePanelGroup direction="horizontal" className="h-full bg-background">
        {/* Left Panel - Prompt Display */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <Card className="h-full min-h-[550px] border border-border">
            <PromptPanel
              promptData={mockPromptData}
              selectedLine={selectedLine}
              onLineSelect={setSelectedLine}
              condition={condition}
              isRunningTests={isRunningTests} // Pass isRunningTests prop to disable highlighting during progress stepper
            />
          </Card>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Feedback Display */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <Card className="h-full min-h-[550px] border border-border">
            <FeedbackPanel
              feedbackData={mockFeedbackData}
              selectedLine={selectedLine}
              condition={condition}
              onClearSelection={() => setSelectedLine(null)}
              isRunningTests={isRunningTests}
              currentStep={currentStep}
              steps={steps} // Pass steps prop to FeedbackPanel for custom progress stepper steps
            />
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
