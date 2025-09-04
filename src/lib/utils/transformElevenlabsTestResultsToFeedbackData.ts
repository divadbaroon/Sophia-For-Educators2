import { AgentResponse } from "@/types"

// Transform ElevenLabs test results to our FeedbackData format 
export const transformTestResultsToFeedbackData = (testResults: any) => {

  // Validate input data
  if (!testResults || !testResults.test_runs) {
    return {
      summary: { total: 0, errors: 0, warnings: 0, passed: 0 },
      items: [],
    };
  }

  // Process each test run
  const items = testResults.test_runs.map((testRun: any, index: number) => {

    // Determine Success/Failure
    const isSuccess = (testRun.condition_result?.result ?? "").toLowerCase() === "success";
    const testName = testRun.metadata?.test_name || `Test ${index + 1}`;

    // Extract Conversation Data
    const conversation: AgentResponse[] = Array.isArray(testRun.agent_responses)
      ? (testRun.agent_responses as AgentResponse[])
      : [];

    console.log(`🔍 Test "${testName}" conversation length:`, conversation.length);
    console.log(`🔍 Test "${testName}" conversation data:`, conversation);

    // Create Conversation Summary
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

    // Get Test Rationale
    const rationaleSummary =
      testRun.condition_result?.rationale?.summary ||
      (isSuccess ? "Test completed successfully" : "Test did not meet the defined success criteria");

    // Build UI Item Object
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
      conversation,
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

  // Calculate Summary Statistics
  const total = items.length;
  const passed = items.filter((item: any) => item.severity === "success").length;
  const failed = total - passed;

  return {
    summary: { total, errors: failed, warnings: 0, passed },
    items,
  };
};