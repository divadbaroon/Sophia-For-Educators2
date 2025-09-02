"use client";

import { useState, useEffect } from "react";

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Card } from "@/components/ui/card";

import { PromptPanel } from "@/components/promptSidePanel/prompt-panel";
import { FeedbackPanel } from "@/components/feedback-panel";

import { loadSavedTests } from "@/lib/storage/tests";

import { ValidationInterfaceProps } from "./types";

// ---------- Helper types ----------
type AgentResponse = {
  role: "user" | "agent" | "tool";
  message?: string | null;
  original_message?: string | null;
  time_in_call_secs?: number | null;
  source_medium?: string | null;
  tool_calls?: any[] | null;
  tool_results?: any[] | null;
  feedback?: { score?: string; time_in_call_secs?: number } | null;
  llm_override?: string | null;
  conversation_turn_metrics?: any | null;
  rag_retrieval_info?: {
    chunks?: Array<{ document_id?: string; chunk_id?: string; vector_distance?: number }>;
    embedding_model?: string;
    retrieval_query?: string;
    rag_latency_secs?: number;
  } | null;
  interrupted?: boolean;
  llm_usage?: any | null;
};

// ---------- Transform ElevenLabs test results to our FeedbackData format ----------
const transformTestResultsToFeedbackData = (testResults: any) => {
  if (!testResults || !testResults.test_runs) {
    return {
      summary: { total: 0, errors: 0, warnings: 0, passed: 0 },
      items: [],
    };
  }

  const items = testResults.test_runs.map((testRun: any, index: number) => {
    const isSuccess = (testRun.condition_result?.result ?? "").toLowerCase() === "success";
    const testName = testRun.metadata?.test_name || `Test ${index + 1}`;

    // Full transcript
    const conversation: AgentResponse[] = Array.isArray(testRun.agent_responses)
      ? (testRun.agent_responses as AgentResponse[])
      : [];

    console.log(`🔍 Test "${testName}" conversation length:`, conversation.length);
    console.log(`🔍 Test "${testName}" conversation data:`, conversation);

    // Pretty evidence string from all turns
    const conversationSummary =
      conversation.length > 0
        ? conversation
            .map((r) => {
              const text = (r.message ?? r.original_message ?? "").toString();
              const role = r.role ?? "agent";
              return `${role}: ${text}`;
            })
            .join("\n")
        : "";

    const rationaleSummary =
      testRun.condition_result?.rationale?.summary ||
      (isSuccess ? "Test completed successfully" : "Test did not meet the defined success criteria");

    const item = {
      id: testRun.test_run_id || `test-${index}`,
      severity: (isSuccess ? "success" : "error"),
      title: testName,
      description:
        testRun.condition_result?.rationale?.summary ||
        (isSuccess
          ? "Test passed - agent response met the success criteria"
          : "Test failed - agent response did not meet the success criteria"),
      evidence:
        (Array.isArray(testRun.condition_result?.rationale?.messages) &&
          testRun.condition_result.rationale.messages.join("\n")) ||
        conversationSummary,
      recommendation: isSuccess
        ? "Great! This test case is working as expected. The agent provided an appropriate response."
        : "Consider reviewing the agent response and adjusting the prompt or configuration to better align with the test criteria.",
      problemOverview: rationaleSummary,
      // Store full transcript for the FeedbackPanel
      conversation,
      // Metadata
      testMetadata: {
        testId: testRun.test_id,
        status: testRun.status,
        runId: testRun.test_run_id,
        lastUpdated: testRun.last_updated_at_unix,
      },
    };

    console.log(`🔍 Transformed item for "${testName}":`, item);
    return item;
  });

  console.log("🔍 All transformed items:", items);

  // Summary stats
  const total = items.length;
  const passed = items.filter((item: any) => item.severity === "success").length;
  const failed = total - passed;

  return {
    summary: { total, errors: failed, warnings: 0, passed },
    items,
  };
};

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
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [feedbackData, setFeedbackData] = useState(() => ({
    summary: { total: 0, errors: 0, warnings: 0, passed: 0 },
    items: [] as any[],
  }));

  // Update feedback data when test results change
  useEffect(() => {
  if (!testResults) return;

  const transformedData = transformTestResultsToFeedbackData(testResults);

  // Map API turns by test_id (API may return only the last agent reply)
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
            <FeedbackPanel
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
