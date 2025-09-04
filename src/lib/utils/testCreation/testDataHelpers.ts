import { ChatMessage } from "@/components/testCreation/types"

export const parsePrimitive = (input: string): string | number | boolean | null => {
  const trimmed = input.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) return Number(trimmed);
  return input;
};

export const createInitialDynamicVars = (data?: Record<string, any>) => ({
  task_description: data?.task_description?.toString() || "",
  student_code: data?.student_code?.toString() || "",
  execution_output: data?.execution_output?.toString() || "",
});

export const createInitialMessages = (agentFirstMessage?: string): ChatMessage[] => [
  { id: "1", type: "agent", text: agentFirstMessage || "Hello, how can I help you today?" }
];