import type { AgentResponse } from "@/lib/storage/tests";

import type { ChatMessage } from "@/components/testCreation/types";

// data format converter that transforms chat messages between two different structures
export function mapChatMessagesToConversation(chatMessages: ChatMessage[] | undefined): AgentResponse[] {
  const msgs = Array.isArray(chatMessages) ? chatMessages : [];
  return msgs.map<AgentResponse>((m) => {
    const role: AgentResponse["role"] = m.type === "user" ? "user" : "agent";
    return { role, message: m.text ?? "" };
  });
}
