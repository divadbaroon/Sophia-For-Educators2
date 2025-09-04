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

interface TestState {
  testId: string
  testName: string
  componentName: string
  evaluationResults: Record<string, {
    criteriaId: string
    result: 'success' | 'failure'
    rationale: string
  }>
  sourceLines: number[]
  selectedProfileId: string
  selectedScenarioId: string
  scenarioOverview: string
  studentProfilePrompt: string
  conversation: Array<{
    role: 'agent' | 'user'
    message: string
    timeInCallSecs?: number
    multivoice_message?: any
    toolCalls?: any[]
    toolResults?: any[]
    interrupted?: boolean
  }>
  finalResult: 'passed' | 'failed'
  transcriptSummary?: string
  callSuccessful?: string
}

export interface ValidationInterfaceCondition1Props {
  isRunningTests?: boolean
  currentStep?: number
  steps?: string[]
  agentInfo?: AgentInfo | null 
  isSaving?: boolean 
  onUpdateConfig?: (prompt: string, firstMessage: string) => Promise<AgentInfo | null>
  enhancedTestResults?: TestState[]
}