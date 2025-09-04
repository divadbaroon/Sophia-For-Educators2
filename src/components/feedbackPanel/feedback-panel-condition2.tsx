"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import { ProgressStepper } from "@/components/feedbackPanel/ProgressStepper";
import { Conversation } from "@/components/feedbackPanel//Conversation";
import { ResultItemCard } from "@/components/feedbackPanel/ResultItemCard";
import type { FeedbackPanelProps, FeedbackItem } from "@/types";

export function FeedbackPanelCondition2({
  feedbackData,
  isRunningTests,
  currentStep = 0,
  steps,
}: FeedbackPanelProps) {
  const [selectedProblem, setSelectedProblem] = useState<FeedbackItem | null>(null);
  const [showAllResults, setShowAllResults] = useState(false);
  const [openOverview, setOpenOverview] = useState(true);
  const [openConversation, setOpenConversation] = useState(true);

  if (selectedProblem) {
    const isPassed = selectedProblem.severity === "success";

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
            <h2 className="text-lg font-semibold text-card-foreground">{selectedProblem.title}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Overview */}
          <div className="border border-border/50 rounded-lg">
            <button
              className={cn(
                "w-full flex items-center justify-between p-3 h-auto font-semibold text-card-foreground rounded-lg cursor-pointer transition-all",
                openOverview ? "bg-muted/30" : "hover:bg-muted/50"
              )}
              onClick={() => setOpenOverview((o) => !o)}
            >
              <span>Overview</span>
              {openOverview ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openOverview && (
              <div className="p-4 bg-muted/20 border-t border-border/30">
                {/* Test Result */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Test Result:</span>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        isPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}
                    >
                      {isPassed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                </div>

                {/* Rationale */}
                {selectedProblem.problemOverview && (
                  <div className="mb-2">
                    <h4 className="text-sm font-medium mb-2">Rationale:</h4>
                    <div className="p-3 bg-card border border-border rounded">
                      <p className="text-sm text-muted-foreground text-pretty">{selectedProblem.problemOverview}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Conversation */}
          <div className="border border-border/50 rounded-lg">
            <button
              className={cn(
                "w-full flex items-center justify-between p-3 h-auto font-semibold text-card-foreground rounded-lg cursor-pointer transition-all",
                openConversation ? "bg-muted/30" : "hover:bg-muted/50"
              )}
              onClick={() => setOpenConversation((o) => !o)}
            >
              <span>Conversation</span>
              {openConversation ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openConversation && (
              <div className="p-4 bg-muted/20 border-t border-border/30">
                <Conversation conversation={selectedProblem.conversation} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List / Summary
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-card -mt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showAllResults ? (
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
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {isRunningTests ? (
          <ProgressStepper currentStep={currentStep} steps={steps} />
        ) : !showAllResults ? (
          <div className="space-y-4">
            {feedbackData.summary.total === 0 ? (
              <Card className="bg-card border border-border">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="text-lg font-medium text-muted-foreground">No test results available</div>
                    <p className="text-sm text-muted-foreground">Run tests to see your agent&apos;s performance</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border border-border">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <div className="text-2xl font-medium space-x-2 whitespace-nowrap">
                        <span className="text-[var(--color-success)]">
                          {feedbackData.summary.passed} passed
                        </span>
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
                          style={{
                            width: `${(feedbackData.summary.passed / feedbackData.summary.total) * 100}%`,
                          }}
                        />
                        <div
                          className="bg-destructive transition-all duration-300"
                          style={{
                            width: `${
                              ((feedbackData.summary.errors + feedbackData.summary.warnings) /
                                feedbackData.summary.total) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Your pedagogical teaching agent has been evaluated against {feedbackData.summary.total} test
                      cases.
                    </p>

                    <div className="border-t border-border my-4" />

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
            {feedbackData.items.map((item) => (
              <ResultItemCard key={item.id} item={item} onOpen={setSelectedProblem} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
