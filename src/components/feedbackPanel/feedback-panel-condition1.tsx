"use client"

import { useState } from "react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Play,
  ArrowLeft,
  Check,
  X,
  Edit,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { FeedbackItem, FeedbackPanelProps } from "@/types"

import { severityConfig } from "@/constants"

export function FeedbackPanel({
  feedbackData,
  selectedLine,
  onClearSelection,
  isRunningTests,
  currentStep,
  steps,
}: FeedbackPanelProps) {
  const [selectedProblem, setSelectedProblem] = useState<FeedbackItem | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview"]))
  const [isEditingChange, setIsEditingChange] = useState(false)
  const [editedChange, setEditedChange] = useState("")
  const [showOriginal, setShowOriginal] = useState(false)

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

  const filteredItems = selectedLine
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
                  Problem Overview
                  {expandedSections.has("overview") ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
                  <p className="text-muted-foreground text-pretty">{selectedProblem.problemOverview}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {selectedProblem.exampleVideos && selectedProblem.exampleVideos.length > 0 && (
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
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedLine && onClearSelection ? (
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
        ) : !selectedLine ? (
          <div className="space-y-4">
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
          </div>
        ) : (
          filteredItems.map((item) => {
            const config = severityConfig[item.severity]
            const Icon = config.icon

            return (
              <Card
                key={item.id}
                className={cn(
                  "transition-all",
                  config.bgColor,
                  config.borderColor,
                )}
              >
                <CardHeader className="transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-card-foreground text-balance">{item.title}</h3>
                        <Icon className={cn("w-5 h-5 shrink-0", config.iconColor)} />
                      </div>
                      {item.lineNumbers && (
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
                      {(item.problemOverview || item.exampleVideos || item.suggestedChange) && (
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
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}