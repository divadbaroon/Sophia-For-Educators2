"use client";

import { useState, useEffect, useRef } from "react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Plus, Trash2, Info, User, Bot } from "lucide-react"

import { TestCreationModalProps, Example, ChatMessage } from "./types"

export function TestCreationModal({ isOpen, onClose, onSave, agentFirstMessage }: TestCreationModalProps) {
  const [testName, setTestName] = useState("")
  const [successCriteria, setSuccessCriteria] = useState("")
  const [successExamples, setSuccessExamples] = useState<Example[]>([])
  const [failureExamples, setFailureExamples] = useState<Example[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", type: "agent", text: agentFirstMessage || "Hello, how can I help you today?" }
  ])

  // Scroll container for messages
  const messagesScrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight
    }
  }, [chatMessages])

  const addSuccessExample = () => {
    setSuccessExamples([...successExamples, { id: Date.now().toString(), text: "" }])
  }

  const removeSuccessExample = (id: string) => {
    setSuccessExamples(successExamples.filter(ex => ex.id !== id))
  }

  const updateSuccessExample = (id: string, text: string) => {
    setSuccessExamples(successExamples.map(ex => ex.id === id ? { ...ex, text } : ex))
  }

  const addFailureExample = () => {
    setFailureExamples([...failureExamples, { id: Date.now().toString(), text: "" }])
  }

  const removeFailureExample = (id: string) => {
    setFailureExamples(failureExamples.filter(ex => ex.id !== id))
  }

  const updateFailureExample = (id: string, text: string) => {
    setFailureExamples(failureExamples.map(ex => ex.id === id ? { ...ex, text } : ex))
  }

  const addUserMessage = () => {
    setChatMessages([...chatMessages, { 
      id: Date.now().toString(), 
      type: "user", 
      text: "" 
    }])
  }

  const addAgentMessage = () => {
    setChatMessages([...chatMessages, { 
      id: Date.now().toString(), 
      type: "agent", 
      text: "" 
    }])
  }

  const updateChatMessage = (id: string, text: string) => {
    setChatMessages(chatMessages.map(msg => 
      msg.id === id ? { ...msg, text } : msg
    ))
  }

  const removeChatMessage = (id: string) => {
    setChatMessages(chatMessages.filter(msg => msg.id !== id))
  }

  const handleSave = () => {
    const testData = {
      testName,
      successCriteria,
      successExamples,
      failureExamples,
      // ✅ include chat history so the API route has a non-empty required array
      chatMessages
    }
    onSave(testData)
    onClose()
  }

  const handleClose = () => {
    // Reset form
    setTestName("")
    setSuccessCriteria("")
    setSuccessExamples([])
    setFailureExamples([])
    setChatMessages([{ id: "1", type: "agent", text: agentFirstMessage || "Hello, how can I help you today?" }])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="min-w-[95vh] min-h-[55vh] overflow-y-auto w-[155vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" />
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Test Name */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Test name
              </label>
              <Input
                placeholder="Your test name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Success Criteria */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Success criteria
              </label>
              <Textarea
                placeholder="Describe the ideal response or behavior the agent should exhibit to pass this test (e.g., provides a correct answer, uses a specific tone, includes key information)."
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
                rows={4}
                className="w-full text-sm"
              />
            </div>

            {/* Success Examples */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">
                  Success Examples
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSuccessExample}
                  className="text-sm"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Example
                </Button>
              </div>
              <div className="space-y-2">
                {successExamples.map((example) => (
                  <div key={example.id} className="flex gap-2">
                    <Textarea
                      placeholder="Enter success example..."
                      value={example.text}
                      onChange={(e) => updateSuccessExample(example.id, e.target.value)}
                      rows={2}
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSuccessExample(example.id)}
                      className="px-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Failure Examples */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">
                  Failure Examples
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFailureExample}
                  className="text-sm"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Example
                </Button>
              </div>
              <div className="space-y-2">
                {failureExamples.map((example) => (
                  <div key={example.id} className="flex gap-2">
                    <Textarea
                      placeholder="Enter failure example..."
                      value={example.text}
                      onChange={(e) => updateFailureExample(example.id, e.target.value)}
                      rows={2}
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFailureExample(example.id)}
                      className="px-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Chat Preview */}
          <div className="h-full">
            <div className="h-full min-h-[500px] bg-gray-50 rounded-lg border border-gray-200 flex flex-col">
              {/* Chat Messages Area */}
              <div className="flex-1 p-4">
                {/* Scrollable messages container */}
                <div
                  ref={messagesScrollRef}
                  className="max-h-[420px] overflow-y-auto pr-1"
                >
                  {/* Render all chat messages */}
                  {chatMessages.map((message, index) => (
                    <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                      <div className={`max-w-sm ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'} rounded-full px-6 py-3 shadow-sm`}>
                        {message.text ? (
                          <p className={`text-sm ${index > 0 ? 'cursor-pointer' : ''}`} onClick={() => {
                            if (index > 0) {
                              const newText = prompt("Edit message:", message.text)
                              if (newText !== null) updateChatMessage(message.id, newText)
                            }
                          }}>
                            {message.text}
                          </p>
                        ) : (
                          <input
                            type="text"
                            placeholder={`Enter ${message.type} message...`}
                            className={`text-sm bg-transparent border-none outline-none w-full ${message.type === 'user' ? 'text-white placeholder-blue-200' : 'text-gray-900 placeholder-gray-400'}`}
                            onBlur={(e) => updateChatMessage(message.id, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                updateChatMessage(message.id, e.currentTarget.value)
                                e.currentTarget.blur()
                              }
                            }}
                            autoFocus
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Controls - Under the last message */}
                {chatMessages.length > 0 && (
                  <div
                    className={`flex items-center gap-1 mt-2 ${
                      chatMessages[chatMessages.length - 1].type === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-100">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem onClick={addUserMessage} className="cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          User message
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={addAgentMessage} className="cursor-pointer">
                          <Bot className="w-4 h-4 mr-2" />
                          Agent message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-100" onClick={() => {
                      if (!chatMessages.length) return
                      setChatMessages((prev) => prev.slice(0, -1))
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Bottom Info */}
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
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Back
          </Button>
          <Button 
            onClick={handleSave}
            disabled={
              !testName.trim() || 
              !successCriteria.trim() ||
              successExamples.length === 0 ||
              failureExamples.length === 0 ||
              !successExamples.some(example => example.text.trim()) ||
              !failureExamples.some(example => example.text.trim())
            }
            className="bg-gray-900 hover:bg-gray-800"
          >
            Save Test
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
