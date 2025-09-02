"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Play,
  ArrowLeft,
  Check,
  X,
  Edit,
  Plus,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface FeedbackItem {
  id: string
  severity: "error" | "warning" | "success" | "info"
  title: string
  description: string
  evidence: string
  recommendation: string
  lineNumbers?: number[]
  problemOverview?: string
  exampleVideos?: Array<{
    id: string
    title: string
    description: string
    thumbnailUrl: string
    videoUrl: string
  }>
  suggestedChange?: {
    before: string
    after: string
    explanation: string
  }
  // Add these new fields for real test data
  conversation?: any[]
  testMetadata?: {
    testId: string
    status: string
    runId: string
    lastUpdated: number
  }
}

interface FeedbackData {
  summary: {
    total: number
    errors: number
    warnings: number
    passed: number
  }
  items: FeedbackItem[]
}

interface FeedbackPanelProps {
  feedbackData: FeedbackData
  selectedLine: number | null
  condition?: string
  onClearSelection?: () => void
  isRunningTests?: boolean
  currentStep?: number
  steps?: string[]
}

const severityConfig = {
  error: {
    icon: AlertCircle,
    color: "text-[var(--color-error)]",
    iconColor: "text-[var(--color-error)]",
    bgColor: "bg-[var(--color-error)]/10",
    borderColor: "border-[var(--color-error)]/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-[var(--color-warning)]",
    iconColor: "text-[var(--color-warning)]",
    bgColor: "bg-[var(--color-warning)]/10",
    borderColor: "border-[var(--color-warning)]/20",
  },
  success: {
    icon: CheckCircle,
    color: "text-[var(--color-success)]",
    iconColor: "text-[var(--color-success)]",
    bgColor: "bg-[var(--color-success)]/10",
    borderColor: "border-[var(--color-success)]/20",
  },
  info: {
    icon: Info,
    color: "text-[var(--color-neutral)]",
    iconColor: "text-[var(--color-neutral)]",
    bgColor: "bg-[var(--color-neutral)]/10",
    borderColor: "border-[var(--color-neutral)]/20",
  },
}

export function FeedbackPanel({
  feedbackData,
  selectedLine,
  condition,
  onClearSelection,
  isRunningTests,
  currentStep,
  steps,
}: FeedbackPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [selectedProblem, setSelectedProblem] = useState<FeedbackItem | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview"]))
  const [isEditingChange, setIsEditingChange] = useState(false)
  const [editedChange, setEditedChange] = useState("")
  const [showOriginal, setShowOriginal] = useState(false)
  const [showAllResults, setShowAllResults] = useState(false)
  const [showTestCreationModal, setShowTestCreationModal] = useState(false)
  const [activeTab, setActiveTab] = useState("llm-evaluation")

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set<string>()
    if (!expandedSections.has(sectionId)) {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const showProblemDetails = (item: FeedbackItem) => {
    setSelectedProblem(item)
    setIsEditingChange(false)
    setEditedChange(item.suggestedChange?.after || "")
  }

  const renderConversation = (conversation: any[]) => {
    if (!conversation || conversation.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-4">
          No conversation data available for this test
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {conversation.map((message: any, index: number) => {
          const isUser = message.role === 'user';
          const isAgent = message.role === 'agent';
          
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                <div className={`text-xs font-medium text-muted-foreground mb-1 ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
                  {isUser ? 'User' : 'Agent'}
                  {message.time_in_call_secs && (
                    <span className="ml-2 text-xs opacity-60">
                      {message.time_in_call_secs}s
                    </span>
                  )}
                  {message.source_medium && (
                    <span className="ml-1 text-xs opacity-60 capitalize">
                      ({message.source_medium})
                    </span>
                  )}
                </div>
                <div className={cn(
                  "border rounded-lg p-3",
                  isUser 
                    ? "bg-blue-500 text-white border-blue-500" 
                    : "bg-card border-border text-card-foreground"
                )}>
                  <p className="text-sm whitespace-pre-wrap">
                    {message.message || message.original_message || 'No message content'}
                  </p>
                  
                  {/* Show if message was interrupted */}
                  {message.interrupted && (
                    <div className="mt-2 pt-2 border-t border-opacity-20">
                      <div className="text-xs opacity-80 italic text-yellow-400">
                        Message was interrupted
                      </div>
                    </div>
                  )}

                  {/* Show LLM override if present */}
                  {message.llm_override && (
                    <div className="mt-2 pt-2 border-t border-opacity-20">
                      <div className="text-xs opacity-80 mb-1">LLM Override:</div>
                      <div className="text-xs opacity-70 font-mono">
                        {message.llm_override}
                      </div>
                    </div>
                  )}
                  
                  {/* Show tool calls if present */}
                  {message.tool_calls && message.tool_calls.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-opacity-20">
                      <div className="text-xs opacity-80 mb-1">Tool calls:</div>
                      {message.tool_calls.map((tool: any, toolIndex: number) => (
                        <div key={toolIndex} className="text-xs opacity-70 mb-1">
                          <strong>{tool.tool_name}</strong>
                          {tool.params_as_json && (
                            <div className="font-mono text-xs mt-1 p-1 bg-black/10 rounded">
                              {tool.params_as_json}
                            </div>
                          )}
                          <div className="text-xs opacity-60">
                            Status: {tool.tool_has_been_called ? 'Called' : 'Not called'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show tool results if present */}
                  {message.tool_results && message.tool_results.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-opacity-20">
                      <div className="text-xs opacity-80 mb-1">Tool results:</div>
                      {message.tool_results.map((result: any, resultIndex: number) => (
                        <div key={resultIndex} className="text-xs opacity-70 mb-1">
                          <strong>{result.tool_name}</strong>: {result.result_value}
                          {result.is_error && <span className="text-red-400 ml-1">(Error)</span>}
                          {result.tool_latency_secs && (
                            <span className="ml-1 opacity-60">({result.tool_latency_secs}s)</span>
                          )}
                          
                          {/* Show dynamic variable updates */}
                          {result.dynamic_variable_updates && result.dynamic_variable_updates.length > 0 && (
                            <div className="mt-1 pl-2 border-l-2 border-blue-300">
                              <div className="text-xs opacity-60">Variable updates:</div>
                              {result.dynamic_variable_updates.map((update: any, updateIndex: number) => (
                                <div key={updateIndex} className="text-xs opacity-60">
                                  {update.variable_name}: {update.old_value} → {update.new_value}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show feedback if present */}
                  {message.feedback && (
                    <div className="mt-2 pt-2 border-t border-opacity-20">
                      <div className="text-xs opacity-80">
                        Feedback: {message.feedback.score} 
                        {message.feedback.time_in_call_secs && (
                          <span className="ml-1">at {message.feedback.time_in_call_secs}s</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show RAG retrieval info if present */}
                  {message.rag_retrieval_info && message.rag_retrieval_info.chunks && (
                    <div className="mt-2 pt-2 border-t border-opacity-20">
                      <div className="text-xs opacity-80 mb-1">
                        RAG Retrieval ({message.rag_retrieval_info.embedding_model}):
                      </div>
                      <div className="text-xs opacity-70">
                        Query: "{message.rag_retrieval_info.retrieval_query}"
                      </div>
                      {message.rag_retrieval_info.chunks.slice(0, 3).map((chunk: any, chunkIndex: number) => (
                        <div key={chunkIndex} className="text-xs opacity-60">
                          Chunk {chunk.chunk_id} (distance: {chunk.vector_distance?.toFixed(3)})
                        </div>
                      ))}
                      {message.rag_retrieval_info.rag_latency_secs && (
                        <div className="text-xs opacity-60">
                          Latency: {message.rag_retrieval_info.rag_latency_secs}s
                        </div>
                      )}
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

  const createDiffView = (before: string, after: string) => {
    const beforeLines = before.split("\n")
    const afterLines = after.split("\n")
    const maxLines = Math.max(beforeLines.length, afterLines.length)

    const diffElements = []
    for (let i = 0; i < maxLines; i++) {
      const beforeLine = beforeLines[i] || ""
      const afterLine = afterLines[i] || ""

      if (beforeLine === afterLine) {
        diffElements.push(
          <div key={i} className="font-mono text-sm py-1">
            {beforeLine || " "}
          </div>,
        )
      } else {
        if (beforeLine) {
          diffElements.push(
            <div
              key={`${i}-before`}
              className="font-mono text-sm py-1 bg-destructive/10 text-destructive border-l-2 border-destructive pl-2"
            >
              <span className="text-destructive/60 mr-2">-</span>
              {beforeLine}
            </div>,
          )
        }
        if (afterLine) {
          diffElements.push(
            <div
              key={`${i}-after`}
              className="font-mono text-sm py-1 bg-[var(--color-success)]/10 text-[var(--color-success)] border-l-2 border-[var(--color-success)] pl-2"
            >
              <span className="text-[var(--color-success)]/60 mr-2">+</span>
              {afterLine}
            </div>,
          )
        }
      }
    }

    return diffElements
  }

  const handleAcceptChange = () => {
    console.log("[v0] Accepting suggested change:", editedChange)
    setIsEditingChange(false)
  }

  const handleRejectChange = () => {
    console.log("[v0] Rejecting suggested change")
    setIsEditingChange(false)
  }

  const handleStartEditing = () => {
    setIsEditingChange(true)
    setEditedChange(selectedProblem?.suggestedChange?.after || "")
  }

  const handleCancelEditing = () => {
    setIsEditingChange(false)
    setEditedChange(selectedProblem?.suggestedChange?.after || "")
  }

  const filteredItems =
    condition === "2"
      ? feedbackData.items
      : selectedLine
        ? feedbackData.items.filter((item) => {
            if (item.lineNumbers?.includes(selectedLine)) {
              return true
            }
            const isPassedLine = !feedbackData.items.some(
              (errorItem) =>
                errorItem.lineNumbers?.includes(selectedLine) &&
                (errorItem.severity === "error" || errorItem.severity === "warning"),
            )
            if (isPassedLine && item.severity === "success" && !item.lineNumbers?.length) {
              return true
            }
            return false
          })
        : []

  const ProgressStepper = () => {
    const progressSteps = steps || [
      "Decomposing Prompt",
      "Setting up test cases",
      "Running test cases",
      "Remediating failures",
    ]

    return (
      <Card className="bg-card border border-border">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-card-foreground mb-2">Running Tests</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we analyze your prompt and run test cases
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="space-y-6 min-w-max pb-8">
                <div className="flex items-start justify-center gap-4 px-4">
                  {progressSteps.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                            (currentStep || 0) > index && "bg-[var(--color-success)] text-white",
                            (currentStep || 0) === index && "bg-blue-500 text-white",
                            (currentStep || 0) < index && "bg-muted text-muted-foreground",
                          )}
                        >
                          {(currentStep || 0) > index ? <Check className="w-4 h-4" /> : index + 1}
                        </div>
                        <div className="text-center w-20 h-8 flex items-start justify-center">
                          <p
                            className={cn(
                              "text-xs font-medium transition-all text-center leading-tight",
                              (currentStep || 0) > index && "text-[var(--color-success)]",
                              (currentStep || 0) === index && "text-blue-500",
                              (currentStep || 0) < index && "text-muted-foreground",
                            )}
                          >
                            {step}
                          </p>
                        </div>
                      </div>
                      {index < progressSteps.length - 1 && (
                        <div className="mx-4 w-8 h-0.5 bg-muted">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              (currentStep || 0) > index ? "bg-[var(--color-success)]" : "bg-muted",
                            )}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (selectedProblem) {
    const config = severityConfig[selectedProblem.severity]
    const Icon = config.icon

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProblem(null)}
              className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-card-foreground">{selectedProblem.title}</h2>
              <Icon className={cn("w-5 h-5", config.iconColor)} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {selectedProblem.problemOverview && (
            <Collapsible open={expandedSections.has("overview")} onOpenChange={() => toggleSection("overview")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between p-3 h-auto font-semibold text-card-foreground rounded-lg border border-border/50 cursor-pointer transition-all text-foreground hover:text-foreground",
                    expandedSections.has("overview")
                      ? "bg-muted/30 hover:bg-muted/30 border-border/30"
                      : "hover:bg-muted/50 hover:border-border",
                  )}
                >
                  {condition === "2" ? "Overview" : "Problem Overview"}
                  {expandedSections.has("overview") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
                  {/* Test Result Summary */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Test Result:</span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        selectedProblem.severity === 'success' 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      )}>
                        {selectedProblem.severity === 'success' ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    
                    {selectedProblem.testMetadata && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Test ID: {selectedProblem.testMetadata.testId}</div>
                        <div>Run ID: {selectedProblem.testMetadata.runId}</div>
                        {selectedProblem.testMetadata.lastUpdated && (
                          <div>Last Updated: {new Date(selectedProblem.testMetadata.lastUpdated * 1000).toLocaleString()}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rationale */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Rationale:</h4>
                    <div className="p-3 bg-card border border-border rounded">
                      <p className="text-sm text-muted-foreground text-pretty">
                        {selectedProblem.problemOverview}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Evidence if available */}
                  {selectedProblem.evidence && selectedProblem.evidence.trim() && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Detailed Evidence:</h4>
                      <div className="p-3 bg-card border border-border rounded">
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedProblem.evidence}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {condition === "2" && (
            <Collapsible open={expandedSections.has("conversation")} onOpenChange={() => toggleSection("conversation")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between p-3 h-auto font-semibold text-card-foreground rounded-lg border border-border/50 cursor-pointer transition-all text-foreground hover:text-foreground",
                    expandedSections.has("conversation")
                      ? "bg-muted/30 hover:bg-muted/30 border-border/30"
                      : "hover:bg-muted/50 hover:border-border",
                  )}
                >
                  Conversation
                  {expandedSections.has("conversation") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
                  {selectedProblem?.conversation && selectedProblem.conversation.length > 0 ? 
                    renderConversation(selectedProblem.conversation) :
                    <div className="text-center text-muted-foreground py-4">
                      No conversation data available for this test
                    </div>
                  }
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {condition !== "2" && selectedProblem.exampleVideos && selectedProblem.exampleVideos.length > 0 && (
            <Collapsible open={expandedSections.has("examples")} onOpenChange={() => toggleSection("examples")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between p-3 h-auto font-semibold text-card-foreground rounded-lg border border-border/50 cursor-pointer transition-all text-foreground hover:text-foreground",
                    expandedSections.has("examples")
                      ? "bg-muted/30 hover:bg-muted/30 border-border/30"
                      : "hover:bg-muted/50 hover:border-border",
                  )}
                >
                  Examples
                  {expandedSections.has("examples") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
                  <div className="space-y-3">
                    {selectedProblem.exampleVideos.map((video) => (
                      <Card key={video.id} className="overflow-hidden">
                        <div className="relative aspect-video bg-muted">
                          <img
                            src={video.thumbnailUrl || "/placeholder.svg"}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Button
                              size="sm"
                              className="bg-white/90 text-black hover:bg-white cursor-pointer"
                              onClick={() => window.open(video.videoUrl, "_blank")}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Play Example
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm text-card-foreground">{video.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{video.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {condition !== "2" && (
            <Collapsible open={expandedSections.has("suggested")} onOpenChange={() => toggleSection("suggested")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between p-3 h-auto font-semibold text-card-foreground rounded-lg border border-border/50 cursor-pointer transition-all text-foreground hover:text-foreground",
                    expandedSections.has("suggested")
                      ? "bg-muted/30 hover:bg-muted/30 border-border/30"
                      : "hover:bg-muted/50 hover:border-border",
                  )}
                >
                  Suggested Change
                  {expandedSections.has("suggested") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
                  {selectedProblem.severity === "success" ? (
                    <div className="flex items-center gap-2 p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-md">
                      <CheckCircle className="w-5 h-5 text-[var(--color-success)] shrink-0" />
                      <p className="text-muted-foreground text-pretty">
                        No suggested changes needed - all test cases passed
                      </p>
                    </div>
                  ) : selectedProblem.suggestedChange ? (
                    <>
                      <div className="mb-4">
                        <p className="text-muted-foreground text-pretty">
                          {selectedProblem.suggestedChange.explanation}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Button
                            variant={!showOriginal ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowOriginal(false)}
                            className={cn(
                              "cursor-pointer text-foreground hover:text-foreground",
                              !showOriginal
                                ? "text-white hover:text-white"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800",
                            )}
                          >
                            Changes
                          </Button>
                          <Button
                            variant={showOriginal ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowOriginal(true)}
                            className={cn(
                              "cursor-pointer text-foreground hover:text-foreground",
                              showOriginal
                                ? "text-white hover:text-white"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800",
                            )}
                          >
                            Original
                          </Button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm text-card-foreground">
                              {showOriginal ? "Original Content" : "Changes"}
                            </h4>
                            <div className="flex items-center gap-2">
                              {!isEditingChange && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleStartEditing}
                                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground bg-transparent"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                              )}
                              {!isEditingChange ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAcceptChange}
                                    className="cursor-pointer hover:bg-[var(--color-success)]/10 hover:border-[var(--color-success)]/20 text-foreground hover:text-foreground bg-transparent"
                                  >
                                    <Check className="w-4 h-4 text-[var(--color-success)] mr-2" />
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRejectChange}
                                    className="cursor-pointer hover:bg-destructive/10 hover:border-destructive/20 text-foreground hover:text-foreground bg-transparent"
                                  >
                                    <X className="w-4 h-4 text-destructive mr-2" />
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAcceptChange}
                                    className="cursor-pointer hover:bg-[var(--color-success)]/10 hover:border-[var(--color-success)]/20 text-foreground hover:text-foreground bg-transparent"
                                  >
                                    <Check className="w-4 h-4 text-[var(--color-success)] mr-2" />
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEditing}
                                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground bg-transparent"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="bg-card border border-border rounded-md p-3 max-h-64 overflow-auto">
                            {showOriginal ? (
                              <div className="font-mono text-sm py-1 whitespace-pre-wrap">
                                {selectedProblem.suggestedChange.before}
                              </div>
                            ) : (
                              createDiffView(
                                selectedProblem.suggestedChange.before,
                                selectedProblem.suggestedChange.after,
                              )
                            )}
                          </div>
                        </div>

                        {isEditingChange && (
                          <div>
                            <h4 className="font-medium text-sm text-card-foreground mb-2">Edit Suggested Change</h4>
                            <Textarea
                              value={editedChange}
                              onChange={(e) => setEditedChange(e.target.value)}
                              className="min-h-32 font-mono text-sm"
                              placeholder="Edit the suggested change..."
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-card -mt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedLine && condition !== "2" && onClearSelection ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                  className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold text-card-foreground">Test Results - For line {selectedLine}</h2>
              </>
            ) : condition === "2" && showAllResults ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllResults(false)}
                  className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold text-card-foreground">Test Results</h2>
              </>
            ) : (
              <h2 className="text-lg font-semibold text-card-foreground">Test Results Overview</h2>
            )}
          </div>
          {selectedLine && (
            <div className="text-sm text-muted-foreground">
              {filteredItems.some((item) => item.severity === "error" || item.severity === "warning")
                ? `Line ${selectedLine} has issues`
                : `Line ${selectedLine} passed validation`}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {isRunningTests ? (
          <ProgressStepper />
        ) : condition === "2" ? (
          !showAllResults ? (
            <div className="space-y-4">
              {feedbackData.summary.total === 0 ? (
                <Card className="bg-card border border-border">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="text-lg font-medium text-muted-foreground">
                        No test results available
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Run tests to see your agent's performance evaluation
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card border border-border">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <div className="text-2xl font-medium space-x-2 whitespace-nowrap">
                          <span className="text-[var(--color-success)]">{feedbackData.summary.passed} passed</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-destructive">
                            {feedbackData.summary.errors + feedbackData.summary.warnings} failed
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          out of {feedbackData.summary.total} total test cases
                        </div>
                      </div>
                      <div className="w-full max-w-md mx-auto">
                        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                          <div
                            className="bg-[var(--color-success)] transition-all duration-300"
                            style={{ width: `${(feedbackData.summary.passed / feedbackData.summary.total) * 100}%` }}
                          />
                          <div
                            className="bg-destructive transition-all duration-300"
                            style={{
                              width: `${((feedbackData.summary.errors + feedbackData.summary.warnings) / feedbackData.summary.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Your pedagogical teaching agent has been evaluated against {feedbackData.summary.total} test
                        cases. The analysis identified areas where the agent's responses may not align with best teaching
                        practices or could potentially confuse students.
                      </p>
                      <div className="border-t border-border my-4"></div>
                      <Button
                        onClick={() => setShowAllResults(true)}
                        className="bg-black text-white hover:bg-gray-800 px-6 py-2 font-semibold cursor-pointer"
                      >
                        See Test Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <>
              {filteredItems.map((item) => {
                const config = severityConfig[item.severity]
                const Icon = config.icon

                const isCondition2 = condition === "2"
                const isPassed = item.severity === "success"
                const condition2Config = isCondition2
                  ? {
                      bgColor: isPassed ? "bg-[var(--color-success)]/10" : "bg-destructive/10",
                      borderColor: isPassed ? "border-[var(--color-success)]/20" : "border-destructive/20",
                      iconColor: isPassed ? "text-[var(--color-success)]" : "text-destructive",
                    }
                  : config

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "transition-all",
                      isCondition2 ? condition2Config.bgColor : config.bgColor,
                      isCondition2 ? condition2Config.borderColor : config.borderColor,
                    )}
                  >
                    <CardHeader className="transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-card-foreground text-balance">{item.title}</h3>
                            <Icon
                              className={cn(
                                "w-5 h-5 shrink-0",
                                isCondition2 ? condition2Config.iconColor : config.iconColor,
                              )}
                            />
                          </div>
                          {condition !== "2" && item.lineNumbers && (
                            <div className="flex gap-1 mt-1 mb-2">
                              {item.lineNumbers.map((lineNum) => (
                                <Badge
                                  key={lineNum}
                                  variant="secondary"
                                  className={cn(
                                    "text-xs",
                                    item.severity === "error" &&
                                      "bg-destructive/10 text-destructive border-destructive/20",
                                    item.severity === "warning" &&
                                      "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20",
                                    item.severity === "success" &&
                                      "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20",
                                  )}
                                >
                                  Line {lineNum}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-1 text-pretty">{item.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation()
                                showProblemDetails(item)
                              }}
                            >
                              {condition === "2" ? "View Results" : "View Details"}
                            </Button>
                            {condition === "2" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs bg-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowTestCreationModal(true)
                                }}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit Test Case
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </>
          )
        ) : !selectedLine ? (
          <div className="space-y-4">
            {feedbackData.summary.total === 0 ? (
              <Card className="bg-card border border-border">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="text-lg font-medium text-muted-foreground">
                      No test results available
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Run tests to see your agent's performance evaluation
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border border-border">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <div className="text-2xl font-medium space-x-2 whitespace-nowrap">
                        <span className="text-[var(--color-success)]">{feedbackData.summary.passed} passed</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-destructive">
                          {feedbackData.summary.errors + feedbackData.summary.warnings} failed
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        out of {feedbackData.summary.total} total test cases
                      </div>
                    </div>
                    <div className="w-full max-w-md mx-auto">
                      <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                        <div
                          className="bg-[var(--color-success)] transition-all duration-300"
                          style={{ width: `${(feedbackData.summary.passed / feedbackData.summary.total) * 100}%` }}
                        />
                        <div
                          className="bg-destructive transition-all duration-300"
                          style={{
                            width: `${((feedbackData.summary.errors + feedbackData.summary.warnings) / feedbackData.summary.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Your pedagogical teaching agent has been evaluated against {feedbackData.summary.total} test cases.
                      The analysis identified areas where the agent's responses may not align with best teaching practices
                      or could potentially confuse students.
                    </p>
                    <div className="border-t border-border my-4"></div>
                    <p className="text-sm text-muted-foreground">
                      Click on a red highlighted line to review and remediate
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          filteredItems.map((item) => {
            const config = severityConfig[item.severity]
            const Icon = config.icon

            const isCondition2 = condition === "2"
            const isPassed = item.severity === "success"
            const condition2Config = isCondition2
              ? {
                  bgColor: isPassed ? "bg-[var(--color-success)]/10" : "bg-destructive/10",
                  borderColor: isPassed ? "border-[var(--color-success)]/20" : "border-destructive/20",
                  iconColor: isPassed ? "text-[var(--color-success)]" : "text-destructive",
                }
              : config

            return (
              <Card
                key={item.id}
                className={cn(
                  "transition-all",
                  isCondition2 ? condition2Config.bgColor : config.bgColor,
                  isCondition2 ? condition2Config.borderColor : config.borderColor,
                )}
              >
                <CardHeader className="transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-card-foreground text-balance">{item.title}</h3>
                        <Icon
                          className={cn(
                            "w-5 h-5 shrink-0",
                            isCondition2 ? condition2Config.iconColor : config.iconColor,
                          )}
                        />
                      </div>
                      {condition !== "2" && item.lineNumbers && (
                        <div className="flex gap-1 mt-1 mb-2">
                          {item.lineNumbers.map((lineNum) => (
                            <Badge
                              key={lineNum}
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                item.severity === "error" && "bg-destructive/10 text-destructive border-destructive/20",
                                item.severity === "warning" &&
                                  "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20",
                                item.severity === "success" &&
                                  "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20",
                              )}
                            >
                              Line {lineNum}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-1 text-pretty">{item.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs bg-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation()
                            showProblemDetails(item)
                          }}
                        >
                          {condition === "2" ? "View Results" : "View Details"}
                        </Button>
                        {condition === "2" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs bg-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowTestCreationModal(true)
                            }}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit Test Case
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={showTestCreationModal} onOpenChange={setShowTestCreationModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="relative">
            <div className="flex items-center gap-4">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("llm-evaluation")}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                    activeTab === "llm-evaluation"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  LLM evaluation
                </button>
                <button
                  onClick={() => setActiveTab("tool-call")}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                    activeTab === "tool-call"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Tool call test
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0">
              <div className="relative">
                <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-sm">
                  <p className="text-sm text-foreground">Hello, how can I help you today?</p>
                </div>
                <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"></div>
                <div className="absolute -bottom-1.5 right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-background"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full bg-background border border-border hover:bg-muted"
                  onClick={() => setShowTestCreationModal(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="test-name" className="text-sm font-medium">
                Test name
              </Label>
              <Input id="test-name" placeholder="Your test name" className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="success-criteria" className="text-sm font-medium">
                Success criteria
              </Label>
              <Textarea
                id="success-criteria"
                placeholder="Describe the ideal response or behavior the agent should exhibit to pass this test (e.g., provides a correct answer, uses a specific tone, includes key information)."
                className="min-h-24 resize-none"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Success Examples</Label>
                <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Example
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Failure Examples</Label>
                <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Example
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Dynamic variables</Label>
              <p className="text-sm text-muted-foreground">
                When testing against an agent in development, dynamic variables will be replaced with these placeholder
                values.
              </p>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" className="px-8 bg-transparent">
                Add New
              </Button>
            </div>
          </div>

          <div className="border-t border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowTestCreationModal(false)}>
                  Back
                </Button>
                <Button className="bg-black text-white hover:bg-gray-800">Save Test</Button>
              </div>
              <p className="text-xs text-muted-foreground max-w-md text-right">
                The agent's response to the last user message will be evaluated against the success criteria using
                examples provided. Previous messages will be passed as context.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}