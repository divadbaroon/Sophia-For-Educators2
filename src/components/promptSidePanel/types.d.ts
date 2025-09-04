export interface PromptData {
  content: string[]
}

export interface PromptPanelProps {
  promptData: PromptData
  onPromptSave?: (newPrompt: string) => Promise<void>
  isSaving?: boolean
}

export interface PromptDataCondition1 {
  title: string
  content: string[]
  highlightedLines: number[]
}

export interface PromptPanelCondition1Props {
  promptData: PromptDataCondition1
  selectedLine: number | null
  onLineSelect: (line: number | null) => void
  isRunningTests?: boolean
  onPromptSave?: (newPrompt: string) => Promise<void>
  isSaving?: boolean
}