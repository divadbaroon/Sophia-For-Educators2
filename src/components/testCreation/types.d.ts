import { AgentInfo } from "@/components/configuration/types";

interface TestCreationProps {
  agentInfo: AgentInfo | null
  isLoading: boolean
  isSaving?: boolean
  error: string | null
  onUpdateConfig: (name: string, prompt: string, firstMessage: string) => Promise<AgentInfo | null>
  onRefresh: () => void
}

export interface TestCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testData: any) => void;
  agentFirstMessage?: string;
  initialData?: InitialData;
}

export interface Example {
  id: string;
  text: string;
}

export interface ChatMessage {
  id: string
  type: 'user' | 'agent'
  text: string
}

export interface InitialData {
  id?: string;
  testName: string;
  successCriteria: string;
  successExamples: Example[];
  failureExamples: Example[];
  chatMessages: ChatMessage[];
  dynamicVariables?: Record<string, string | number | boolean | null>;
}