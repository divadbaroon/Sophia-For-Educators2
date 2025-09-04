"use client";

import { useState, useEffect } from "react";

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Card } from "@/components/ui/card";

import { PromptPanel } from "@/components/promptSidePanel/prompt-panel-condition2";
import { FeedbackPanelCondition2 } from "@/components/feedbackPanel/feedback-panel-condition2";

import { loadSavedTests } from "@/lib/storage/tests";

import { transformTestResultsToFeedbackData } from "@/lib/utils/transformElevenlabsTestResultsToFeedbackData"

import { ValidationInterfaceProps } from "./types";

import { AgentResponse } from "@/types"

export function ValidationInterface({
    condition = "1",
    isRunningTests,
    currentStep,
    steps,
    agentInfo,
    isSaving = false,
    onUpdateConfig,
    testResults,
  }: ValidationInterfaceProps & { testResults?: any }) {

  // Tracks which prompt line is selected (passed to PromptPanel)
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  // Stores processed test results for FeedbackPanel display
  const [feedbackData, setFeedbackData] = useState(() => ({
    summary: { total: 0, errors: 0, warnings: 0, passed: 0 },
    items: [] as any[],
  }));

  // Update feedback data when test results change
  useEffect(() => {
    if (!testResults) return;

    //convert ElevenLabs results to UI format.
    const transformedData = transformTestResultsToFeedbackData(testResults);

    // Extract API Conversations by Test ID
    const apiByTestId = new Map<string, AgentResponse[]>();
    for (const run of testResults.test_runs ?? []) {
      const raw = Array.isArray(run.agent_responses) ? run.agent_responses : [];

      // normalize roles ('assistant' -> 'agent')
      const apiConv: AgentResponse[] = raw.map((m: any) => ({
        role: m.role === "assistant" ? "agent" : (m.role ?? "agent"),
        message: m.message ?? m.original_message ?? "",
        original_message: m.original_message ?? null,
        time_in_call_secs: m.time_in_call_secs ?? null,
        source_medium: m.source_medium ?? null,
        tool_calls: m.tool_calls ?? null,
        tool_results: m.tool_results ?? null,
        feedback: m.feedback ?? null,
        llm_override: m.llm_override ?? null,
        conversation_turn_metrics: m.conversation_turn_metrics ?? null,
        rag_retrieval_info: m.rag_retrieval_info ?? null,
        interrupted: m.interrupted ?? false,
        llm_usage: m.llm_usage ?? null,
      }));

      apiByTestId.set(run.test_id, apiConv);
    }

    // read locally saved tests to pull prior conversation (display only)
    const saved = loadSavedTests();

    // stitch local conversation + api last turn(s)
    const mergedItems = transformedData.items.map((it: any) => {
      const testId = it.testMetadata?.testId || it.test_id;
      if (!testId) return it;

      const localConv = (saved.find(s => s.id === testId)?.conversation ?? []) as AgentResponse[];
      const apiConv = apiByTestId.get(testId) ?? [];

      // tiny de-dupe: drop first API turn if it equals the last local turn
      const shouldDropFirstApi =
        localConv.length > 0 &&
        apiConv.length > 0 &&
        (localConv[localConv.length - 1]?.role ?? "") === (apiConv[0]?.role ?? "") &&
        (localConv[localConv.length - 1]?.message ?? "") === (apiConv[0]?.message ?? "");

      const mergedConversation = [...localConv, ...(shouldDropFirstApi ? apiConv.slice(1) : apiConv)];

      return { ...it, conversation: mergedConversation };
    });

    setFeedbackData({ ...transformedData, items: mergedItems });
  }, [testResults]);


  const handlePromptSave = async (newPrompt: string) => {
    if (!agentInfo || !onUpdateConfig) return;

    await onUpdateConfig(agentInfo.name, newPrompt, agentInfo.first_message);
  };

  return (
    <div className="h-full w-full p-0 gap-4 flex">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full bg-background">
        {/* Left Panel - Prompt Display */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <Card className="h-full border border-border">
            {agentInfo ? (
              <PromptPanel
                promptData={{
                  content: agentInfo.prompt ? agentInfo.prompt.split("\n") : [],
                }}
                onPromptSave={handlePromptSave}
                isSaving={isSaving}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No agent data available</p>
              </div>
            )}
          </Card>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Feedback Display */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <Card className="h-full border border-border">
            <FeedbackPanelCondition2
              feedbackData={feedbackData}
              selectedLine={selectedLine}
              condition={condition}
              onClearSelection={() => setSelectedLine(null)}
              isRunningTests={isRunningTests}
              currentStep={currentStep}
              steps={steps}
            />
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
