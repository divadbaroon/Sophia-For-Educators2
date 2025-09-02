export interface PromptData {
  content: string[]
}

export interface PromptPanelProps {
  promptData: PromptData
  onPromptSave?: (newPrompt: string) => Promise<void>
  isSaving?: boolean
}