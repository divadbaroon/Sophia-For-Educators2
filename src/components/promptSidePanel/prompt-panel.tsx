"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"

import { Edit3, Save } from "lucide-react"

import { PromptPanelProps } from "./types"

export function PromptPanel({ promptData, onPromptSave, isSaving = false }: PromptPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState<string[]>(promptData.content)

  useEffect(() => {
    setEditedContent(promptData.content)
  }, [promptData.content])

  const handleSave = async () => {
    if (onPromptSave) {
      await onPromptSave(editedContent.join('\n'));
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(promptData.content)
    setIsEditing(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card -mt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">System Prompt</h2>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div>
          {isEditing ? (
            <textarea
              value={editedContent.join('\n')}
              onChange={(e) => setEditedContent(e.target.value.split('\n'))}
              placeholder="Enter agent prompt"
              className="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono resize-none"
              rows={25}
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">
                {promptData.content.join('\n')}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}