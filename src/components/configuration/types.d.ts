export interface AgentInfo {
  agent_id: string;
  name: string;
  prompt: string;
  first_message: string;
}

export interface AgentConfigurationProps {
  agentInfo: AgentInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  onUpdateConfig: (name: string, prompt: string, firstMessage: string) => Promise<AgentInfo | null>;
  onRefresh: () => void;
}