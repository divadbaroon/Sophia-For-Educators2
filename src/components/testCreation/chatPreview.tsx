"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Info, User, Bot } from "lucide-react";

import { ChatMessage } from "@/components/testCreation/types"

function ChatPreview({ 
  messages, 
  onAddUser, 
  onAddAgent, 
  onUpdateMessage, 
  onRemoveLast, 
  messagesRef 
}: {
  messages: ChatMessage[];
  onAddUser: () => void;
  onAddAgent: () => void;
  onUpdateMessage: (id: string, text: string) => void;
  onRemoveLast: () => void;
  messagesRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="h-full">
      <div className="h-full min-h-[500px] bg-gray-50 rounded-lg border border-gray-200 flex flex-col">
        <div className="flex-1 p-4">
          <div ref={messagesRef} className="max-h-[420px] overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`mb-4 ${message.type === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div className={`max-w-sm ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200'
                } rounded-full px-6 py-3 shadow-sm`}>
                  {message.text ? (
                    <p 
                      className={`text-sm ${index > 0 ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (index > 0) {
                          const newText = prompt("Edit message:", message.text);
                          if (newText !== null) onUpdateMessage(message.id, newText);
                        }
                      }}
                    >
                      {message.text}
                    </p>
                  ) : (
                    <input
                      type="text"
                      placeholder={`Enter ${message.type} message...`}
                      className={`text-sm bg-transparent border-none outline-none w-full ${
                        message.type === 'user' 
                          ? 'text-white placeholder-blue-200' 
                          : 'text-gray-900 placeholder-gray-400'
                      }`}
                      onBlur={(e) => onUpdateMessage(message.id, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateMessage(message.id, e.currentTarget.value);
                          e.currentTarget.blur();
                        }
                      }}
                      autoFocus
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {messages.length > 0 && (
            <div className={`flex items-center gap-1 mt-2 ${
              messages[messages.length - 1].type === "user" ? "justify-end" : "justify-start"
            }`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-100">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={onAddUser} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    User message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAddAgent} className="cursor-pointer">
                    <Bot className="w-4 h-4 mr-2" />
                    Agent message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-100" onClick={onRemoveLast}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex items-start gap-3 text-xs text-gray-600">
            <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center mt-0.5 flex-shrink-0">
              <Info className="w-2.5 h-2.5" />
            </div>
            <p className="leading-relaxed">
              The agent's response to the last user message will be evaluated against the success criteria using examples provided. Previous messages will be passed as context.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPreview