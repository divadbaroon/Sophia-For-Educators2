"use client"

import { useState, useEffect } from "react"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

import { Edit3, Save, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { PromptPanelCondition1Props } from "./types"

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
}

export function PromptPanelCondition1({
  promptData,
  selectedLine,
  onLineSelect,
  isRunningTests = false,
  onPromptSave,
  isSaving = false,
  testResults = [], // Add testResults prop
}: PromptPanelCondition1Props & { testResults?: TestResult[] }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(promptData.content.join("\n"))
  const [editedLines, setEditedLines] = useState<Set<number>>(new Set())

  // Update editedContent when promptData changes
  useEffect(() => {
    setEditedContent(promptData.content.join("\n"))
  }, [promptData.content])

  const handleSave = async () => {
    const newLines = editedContent.split("\n")
    const changedLines = new Set<number>()

    // Track which lines were changed
    newLines.forEach((line, index) => {
      if (line !== promptData.content[index]) {
        changedLines.add(index + 1)
      }
    })

    setEditedLines(changedLines)

    // Call the save callback if provided
    if (onPromptSave) {
      await onPromptSave(editedContent)
    }
    
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(promptData.content.join("\n"))
    setIsEditing(false)
  }

  // Get line status based on test results
  const getLineStatus = (lineNumber: number, lineContent: string) => {
    if (isRunningTests || !testResults || testResults.length === 0) {
      return 'neutral'
    }

    // Map test results to line highlighting logic
    // This is a simplified mapping - you might want to make this more sophisticated
    const failedTests = testResults.filter(test => !test.success)
    const passedTests = testResults.filter(test => test.success)

    // Example logic: highlight certain keywords/sections based on test results
    const isPromptSection = lineContent.trim().toLowerCase().includes('you are') || 
                           lineContent.trim().toLowerCase().includes('your role') ||
                           lineContent.trim().toLowerCase().includes('teaching style')
    
    const isInstructionSection = lineContent.trim().toLowerCase().includes('instructions') ||
                                lineContent.trim().toLowerCase().includes('guidelines') ||
                                lineContent.trim().toLowerCase().includes('approach')

    // If there are failed tests related to core pedagogical components
    if (failedTests.length > 0 && isPromptSection) {
      return 'error'
    }

    // If there are failed tests related to instruction following
    if (failedTests.some(test => test.componentName.includes('Step-by-Step') || 
                                test.componentName.includes('Structured')) && 
        isInstructionSection) {
      return 'error'
    }

    // If line seems to be working well based on passed tests
    if (passedTests.length > 0 && (isPromptSection || isInstructionSection)) {
      return 'success'
    }

    return 'neutral'
  }

  const currentContent = isEditing ? editedContent.split("\n") : promptData.content

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card -mt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-card-foreground">System Prompt</h2>
            {testResults && testResults.length > 0 && !isRunningTests && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">
                  {testResults.filter(t => t.success).length} passed
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-red-600">
                  {testResults.filter(t => !t.success).length} failed
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
                disabled={isSaving || isRunningTests}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="cursor-pointer bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="cursor-pointer bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <div className="h-full p-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="h-full font-mono text-sm resize-none"
              placeholder="Enter your system prompt..."
              disabled={isSaving}
            />
          </div>
        ) : (
          <div className="bg-[var(--color-code-bg)] font-mono text-sm">
            {currentContent.map((line, index) => {
              const lineNumber = index + 1
              const isSelected = selectedLine === lineNumber
              const isEdited = editedLines.has(lineNumber)
              const lineStatus = getLineStatus(lineNumber, line)
              
              const isClickable = !isRunningTests

              return (
                <div
                  key={lineNumber}
                  className={cn(
                    "flex transition-colors",
                    isClickable && "hover:bg-muted/50 cursor-pointer",
                    // Test result highlighting
                    lineStatus === 'error' && "bg-red-50 dark:bg-red-950/20 border-l-2 border-l-red-500",
                    lineStatus === 'success' && "bg-green-50 dark:bg-green-950/20 border-l-2 border-l-green-500",
                    // Edited line highlighting
                    isEdited && "bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500",
                    // Selected line highlighting
                    isSelected && "bg-primary/10",
                  )}
                  onClick={() => (isClickable ? onLineSelect(isSelected ? null : lineNumber) : undefined)}
                >
                  {/* Line Number */}
                  <div className={cn(
                    "w-12 px-2 py-1 text-right select-none shrink-0 border-r border-border/50",
                    lineStatus === 'error' && "text-red-600",
                    lineStatus === 'success' && "text-green-600",
                    lineStatus === 'neutral' && "text-[var(--color-line-number)]"
                  )}>
                    {lineNumber}
                  </div>

                  {/* Code Content */}
                  <div className="flex-1 px-4 py-1 text-foreground whitespace-pre-wrap break-words">
                    {line || " "}
                  </div>

                  {/* Test indicator */}
                  {lineStatus !== 'neutral' && !isRunningTests && (
                    <div className="px-2 py-1 flex items-center">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        lineStatus === 'error' && "bg-red-500",
                        lineStatus === 'success' && "bg-green-500"
                      )} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}