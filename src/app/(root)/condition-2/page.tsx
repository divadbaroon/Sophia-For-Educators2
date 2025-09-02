"use client"

import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { AgentConfiguration } from "@/components/configuration/AgentConfiguration"
import { ValidationInterface } from "@/components/testResults/validation-interface"
import { TestCreation } from "@/components/testCreation/test-creation"

import { useFetchAgentConfig, useUpdateAgentConfig } from "@/lib/hooks/configuration/useAgentConfiguration"
import { useRunTests } from "@/lib/hooks/tests/useAgentTesting"
import { loadSavedTests } from "@/lib/storage/tests"

import { AgentInfo } from "@/components/configuration/types"

const ConditionTwoPage = () => {
  const [activeTab, setActiveTab] = useState<"configuration" | "testCreation" | "validation">("configuration")
  const [testsRun, setTestsRun] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null)
  const [testResults, setTestResults] = useState<any>(null)

  const { fetchAgentConfig, isLoading, error: fetchError } = useFetchAgentConfig()
  const { updateAgentConfig, isSaving, error: updateError } = useUpdateAgentConfig()
  const { runTests, isRunning: isRunningTestsAPI, error: runTestsError } = useRunTests()

  const error = fetchError || updateError || runTestsError
  const steps = ["Setting up test cases", "Running test cases", "Processing results"]

  // Load agent config on component mount
  const handleFetchConfig = async () => {
    const agentData = await fetchAgentConfig()
    if (agentData) {
      setAgentInfo(agentData)
    }
  }

  // Update agent config
  const handleUpdateConfig = async (name: string, prompt: string, firstMessage: string) => {
    const updatedAgentData = await updateAgentConfig(name, prompt, firstMessage)
    if (updatedAgentData) {
      setAgentInfo(updatedAgentData)
    }
    return updatedAgentData
  }

  const handleRunTests = async () => {
  if (!agentInfo?.agent_id) {
    console.error('No agent ID available');
    return;
  }

  // Get saved test IDs from localStorage
  const savedTests = loadSavedTests();
  const testIds = savedTests.map(test => test.id);

  if (testIds.length === 0) {
    console.error('No tests available to run');
    // You might want to show a user-friendly message here
    return;
  }

  setActiveTab("validation");
  setIsRunningTests(true);
  setCurrentStep(0);
  setTestResults(null);

  try {
    // Step 1: Setting up test cases
    setCurrentStep(0);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Running test cases and awaiting completion
    setCurrentStep(1);
    console.log('🚀 Starting test execution and awaiting results...');
    
    const runData = {
      agentId: agentInfo.agent_id,
      testIds: testIds
      // Tests will run against the agent's current saved configuration
    };

    // This will now poll until completion or until agent_responses are available
    const testRunResponse = await runTests(runData);
    
    if (testRunResponse) {
      // Step 3: Processing and displaying results
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Log the complete results for debugging
      console.log('📊 Complete test results:', JSON.stringify(testRunResponse, null, 2));
      
      setTestResults(testRunResponse);
      console.log('📊 All test results received and processed');
      setTestsRun(true);
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  } finally {
    setIsRunningTests(false);
  }
};

  useEffect(() => {
    handleFetchConfig()
  }, [])

  return (
    <main className="wrapper-full min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm mt-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Agent Configuration</h1>
              <p className="text-sm text-gray-500 mt-1">Configure your tutor agent to match your pedagogical teaching style</p>
            </div>
            <Button
              onClick={handleRunTests}
              disabled={isRunningTests || isLoading || !agentInfo?.agent_id}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2"
            >
              {isRunningTests ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Run Tests
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Global Error Display */}
        {error && (
          <div className="mb-6">
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          {/* Main Content Card */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <Button
                    variant={activeTab === "configuration" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setActiveTab("configuration")}
                    className={`h-8 px-4 ${
                      activeTab === "configuration"
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Configuration
                  </Button>
                  <Button
                    variant={activeTab === "testCreation" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setActiveTab("testCreation")}
                    className={`h-8 px-4 ${
                      activeTab === "testCreation"
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Test Creation
                  </Button>
                  <Button
                    variant={activeTab === "validation" && testsRun ? "default" : "secondary"}
                    size="sm"
                    onClick={() => testsRun && setActiveTab("validation")}
                    disabled={!testsRun}
                    title={!testsRun ? "Run tests first" : ""}
                    className={`h-8 px-4 ${
                      activeTab === "validation" && testsRun
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Test Results
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "configuration" && (
                <AgentConfiguration 
                  agentInfo={agentInfo}
                  isLoading={isLoading}
                  isSaving={isSaving}
                  error={error}
                  onUpdateConfig={handleUpdateConfig}
                  onRefresh={handleFetchConfig}
                />
              )}
              {activeTab === "testCreation" && (
                <div className="h-[600px]">
                  <TestCreation 
                    agentInfo={agentInfo}
                    isLoading={isLoading}
                    isSaving={isSaving}
                    error={error}
                    onUpdateConfig={handleUpdateConfig}
                    onRefresh={handleFetchConfig}
                  />
                </div>
              )}
              {activeTab === "validation" && (
                <div className="h-[600px]">
                  {testsRun || isRunningTests ? (
                    <ValidationInterface
                      condition="2"
                      isRunningTests={isRunningTests}
                      currentStep={currentStep}
                      steps={steps}
                      agentInfo={agentInfo}
                      isSaving={isSaving}
                      onUpdateConfig={handleUpdateConfig}
                      testResults={testResults}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Click "Run Tests" to begin validation</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default ConditionTwoPage