import { AgentInfo } from "@/components/configuration/types";

interface TestCreationProps {
  agentInfo: AgentInfo | null
  isLoading: boolean
  isSaving?: boolean
  error: string | null
  onUpdateConfig: (name: string, prompt: string, firstMessage: string) => Promise<AgentInfo | null>
  onRefresh: () => void
}

interface TestCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (testData: any) => void
  agentFirstMessage?: string  
}

export interface Example {
  id: string
  text: string
}

export interface ChatMessage {
  id: string
  type: 'user' | 'agent'
  text: string
}