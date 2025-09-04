"use client";

import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "agent" | "tool";
  message?: string | null;
  original_message?: string | null;
  time_in_call_secs?: number | null;
  source_medium?: string | null;
  interrupted?: boolean | null;
  llm_override?: string | null;
  tool_calls?: any[] | null;
  tool_results?: any[] | null;
  rag_retrieval_info?: any | null;
};

export const Conversation = ({ conversation }: { conversation: Message[] | undefined }) => {
  if (!conversation || conversation.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No conversation data available for this test
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversation.map((msg, i) => {
        const isUser = msg.role === "user";
        return (
          <div key={i} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
            <div className="max-w-[80%]">
              <div
                className={cn(
                  "text-xs font-medium text-muted-foreground mb-1",
                  isUser ? "text-right mr-1" : "ml-1"
                )}
              >
                {isUser ? "User" : "Agent"}
                {msg.time_in_call_secs != null && (
                  <span className="ml-2 text-xs opacity-60">{msg.time_in_call_secs}s</span>
                )}
                {msg.source_medium && (
                  <span className="ml-1 text-xs opacity-60 capitalize">({msg.source_medium})</span>
                )}
              </div>

              <div
                className={cn(
                  "border rounded-lg p-3",
                  isUser ? "bg-blue-500 text-white border-blue-500" : "bg-card border-border text-card-foreground"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {msg.message || msg.original_message || "No message content"}
                </p>

                {msg.interrupted && (
                  <div className="mt-2 pt-2 border-t border-opacity-20">
                    <div className="text-xs opacity-80 italic">Message was interrupted</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
