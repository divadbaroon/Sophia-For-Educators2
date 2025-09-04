import { useState } from "react";

import { ChatMessage } from "@/components/testCreation/types"

export const useChatMessages = (initialMessages: ChatMessage[] = []) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const addUser = () => setMessages([...messages, { id: Date.now().toString(), type: "user", text: "" }]);
  const addAgent = () => setMessages([...messages, { id: Date.now().toString(), type: "agent", text: "" }]);
  const update = (id: string, text: string) => setMessages(messages.map(msg => msg.id === id ? { ...msg, text } : msg));
  const removeLast = () => messages.length > 1 && setMessages(messages.slice(0, -1));

  return { messages, setMessages, addUser, addAgent, update, removeLast };
};
