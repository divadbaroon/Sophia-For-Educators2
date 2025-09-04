"use client"

import { useState, useEffect } from "react"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

import { Edit3, Save, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { PromptDataCondition1, PromptPanelCondition1Props } from "./types"

export function PromptPanelCondition1({
  promptData,
  selectedLine,
  onLineSelect,
  isRunningTests = false,
  onPromptSave,
  isSaving = false,
}: PromptPanelCondition1Props) {
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

  const currentContent = isEditing ? editedContent.split("\n") : promptData.content

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">System Prompt</h2>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
                disabled={isSaving} // Disable during save operations
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
              const isHighlighted = promptData.highlightedLines.includes(lineNumber)
              const isSelected = selectedLine === lineNumber
              const isEdited = editedLines.has(lineNumber)
              const isSectionHeader =
                line.trim().startsWith("#") &&
                (line.includes("Personality") ||
                  line.includes("Environment") ||
                  line.includes("Tone") ||
                  line.includes("Goal") ||
                  line.includes("Guardrails") ||
                  line.includes("Teaching Style"))
              const isPassed = !isHighlighted && line.trim() !== "" && !isSectionHeader

              const showHighlighting = !isRunningTests
              const isClickable = !isRunningTests

              return (
                <div
                  key={lineNumber}
                  className={cn(
                    "flex transition-colors",
                    isClickable && "hover:bg-muted/50 cursor-pointer",
                    showHighlighting && isHighlighted && "bg-destructive/10 border-l-2 border-l-destructive",
                    showHighlighting && isPassed && "bg-green-50 dark:bg-green-950/20 border-l-2 border-l-green-500",
                    isEdited && "bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500",
                    isSelected && "bg-primary/10",
                  )}
                  onClick={() => (isClickable ? onLineSelect(isSelected ? null : lineNumber) : undefined)}
                >
                  {/* Line Number */}
                  <div className="w-12 px-2 py-1 text-[var(--color-line-number)] text-right select-none shrink-0 border-r border-border/50">
                    {lineNumber}
                  </div>

                  {/* Code Content */}
                  <div className="flex-1 px-4 py-1 text-foreground whitespace-pre-wrap break-words">{line || " "}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}