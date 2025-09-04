"use client"

import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { ValidationInterface } from "@/components/testResults/validation-interface-condition1"
import { AgentConfiguration } from "@/components/configuration/AgentConfiguration"

import { useFetchAgentConfig, useUpdateAgentConfig } from "@/lib/hooks/configuration/useAgentConfiguration"

import { AgentInfo } from "@/components/configuration/types"

const ConditionOnePage = () => {

  // Stores the agent configuration data
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null)

  // Controls which tab view is shown (configuration, testCreation, validation)
  const [activeTab, setActiveTab] = useState<"configuration" | "validation">("configuration")

  // Manages the test execution progress
  const [currentStep, setCurrentStep] = useState(0)
  const steps = ["Decomposing Prompt", "Setting up test cases", "Running test cases", "Remediating failures"]

  // Tracks whether tests have been completed
  const [testsRun, setTestsRun] = useState(false)
  const [isRunningTests, setIsRunningTests] = useState(false)

  // Get agent configuration
  const { fetchAgentConfig, isLoading, error: fetchError } = useFetchAgentConfig()
  // Update agent configuration
  const { updateAgentConfig, isSaving, error: updateError } = useUpdateAgentConfig()

  const error = fetchError || updateError 

  // Load agent config on component mount
  const handleFetchConfig = async () => {
    const agentData = await fetchAgentConfig()
    if (agentData) {
      setAgentInfo(agentData)
    }
  }

  // Updates agent configuration and refreshes local state
  const handleUpdateConfig = async (prompt: string, firstMessage: string) => {
    const updatedAgentData = await updateAgentConfig(prompt, firstMessage)
    if (updatedAgentData) {
      setAgentInfo(updatedAgentData)
    }
    return updatedAgentData
  }

  const handleRunTests = async () => {
    setActiveTab("validation")
    setIsRunningTests(true)
    setCurrentStep(0)

    // Simulate progress through steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    setIsRunningTests(false)
    setTestsRun(true)
  }

  useEffect(() => {
    handleFetchConfig()
  }, [])

  return (
    <main className="wrapper page min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm mt-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Prompt Validation Testing</h1>
              <p className="text-sm text-gray-500">AI-powered validation and testing for educational prompts</p>
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
                    variant={activeTab === "validation" ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setActiveTab("validation")}
                    className={`h-8 px-4 ${
                      activeTab === "validation"
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
              {activeTab === "configuration" && 
               <AgentConfiguration 
                  agentInfo={agentInfo}
                  isLoading={isLoading}
                  isSaving={isSaving}
                  error={error}
                  onUpdateConfig={handleUpdateConfig}
                  onRefresh={handleFetchConfig}
                />
              }
              {activeTab === "validation" && (
                <div className="h-[600px]">
                  {testsRun || isRunningTests ? (
                    <ValidationInterface 
                      isRunningTests={isRunningTests} 
                      currentStep={currentStep}
                      steps={steps}
                      agentInfo={agentInfo}
                      isSaving={isSaving}
                      onUpdateConfig={handleUpdateConfig}
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

export default ConditionOnePage
