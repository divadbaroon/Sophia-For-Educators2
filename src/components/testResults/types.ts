import { AgentInfo } from "@/components/configuration/types"

export interface ValidationInterfaceProps {
  condition?: "1" | "2"
  isRunningTests?: boolean
  currentStep?: number
  steps?: string[]
  agentInfo?: AgentInfo | null
  isSaving?: boolean
  onUpdateConfig?: (name: string, prompt: string, firstMessage: string) => Promise<AgentInfo | null>
}

export interface ValidationInterfaceCondition1Props {
  isRunningTests?: boolean
  currentStep?: number
  steps?: string[]
  agentInfo?: AgentInfo | null 
  isSaving?: boolean 
  onUpdateConfig?: (prompt: string, firstMessage: string) => Promise<AgentInfo | null> 
}