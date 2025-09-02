import { useState } from 'react';
import { AgentInfo } from '@/components/configuration/types';

export function useFetchAgentConfig() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgentConfig = async (): Promise<AgentInfo | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching agent configuration...');
      
      const response = await fetch('/api/elevenlabs/get-agent-config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch agent config');
      }

      const data = await response.json();
      const agentData: AgentInfo = {
        agent_id: data.agent_id,
        name: data.name,
        prompt: data.conversation_config.agent.prompt.prompt,
        first_message: data.conversation_config.agent.first_message || ""
      };

      console.log('✅ Agent configuration fetched successfully');
      return agentData;

    } catch (error) {
      console.error('❌ Error fetching agent config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch agent configuration';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchAgentConfig,
    isLoading,
    error
  };
}

export function useUpdateAgentConfig() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAgentConfig = async (
    name: string,
    prompt: string,
    first_message: string
  ): Promise<AgentInfo | null> => {
    setIsSaving(true);
    setError(null);

    try {
      console.log('💾 Updating agent configuration...');
      
      const response = await fetch('/api/elevenlabs/update-agent-config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          prompt,
          first_message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update agent config');
      }

      const data = await response.json();
      const updatedAgentData: AgentInfo = {
        agent_id: data.agent_id,
        name: data.name,
        prompt: data.conversation_config.agent.prompt.prompt,
        first_message: data.conversation_config.agent.first_message || ""
      };

      console.log('✅ Agent configuration updated successfully');
      return updatedAgentData;

    } catch (error) {
      console.error('❌ Error updating agent config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update agent configuration';
      setError(errorMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    updateAgentConfig,
    isSaving,
    error
  };
}