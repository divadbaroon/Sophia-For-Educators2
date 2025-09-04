"use client"

import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { ValidationInterfaceCondition1 } from "@/components/testResults/validation-interface-condition1"
import { AgentConfiguration } from "@/components/configuration/AgentConfiguration"

import { useFetchAgentConfig, useUpdateAgentConfig } from "@/lib/hooks/configuration/useAgentConfiguration"

import { AgentInfo } from "@/components/configuration/types"

import { scenarioTemplates } from "@/lib/testCaseData/scenarioData"
import { simulatedStudentProfiles } from "@/lib/testCaseData/studentProfiles"

interface PedagogicalComponent {
  name: string
  description: string
  sourceLines: number[]
  testableBehaviors: string[]
  failureIndicators: string[]
}

// Enhanced test state interface that includes all necessary information
export interface TestState {
  testId: string
  testName: string
  componentName: string
  evaluationResults: Record<string, {
    criteriaId: string
    result: 'success' | 'failure'
    rationale: string
  }>
  sourceLines: number[]
  selectedProfileId: string
  selectedScenarioId: string
  scenarioOverview: string
  studentProfilePrompt: string
  conversation: Array<{
    role: 'agent' | 'user'
    message: string
    timeInCallSecs?: number
    multivoice_message?: any
    toolCalls?: any[]
    toolResults?: any[]
    interrupted?: boolean
  }>
  finalResult: 'passed' | 'failed'
  transcriptSummary?: string
  callSuccessful?: string
  remediationSuggestion?: {
    analysis: {
      pedagogicalGap: string
      rootCause: string
      targetedFix: string
    }
    suggestions: Array<{
      changeType: 'replace' | 'add' | 'modify' | 'restructure'
      affectedLines: number[]
      originalContent: string
      suggestedContent: string
      rationale: string
      pedagogicalPrinciple: string
    }>
  }
}

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
  const [isRerunning, setIsRerunning] = useState(false)

  const [preparedTests, setPreparedTests] = useState(null)

  const [testResults, setTestResults] = useState([])
  const [enhancedTestResults, setEnhancedTestResults] = useState<TestState[]>([])
  const [isGeneratingRemediation, setIsGeneratingRemediation] = useState(false)

  const [pedagogicalComponents, setPedagogicalComponents] = useState<PedagogicalComponent[] | null>(null)
  const [lastTestRun, setLastTestRun] = useState<{
    decompositionData: any;
    allTestCases: any[];
    timestamp: number;
  } | null>(null)

  // Get agent configuration
  const { fetchAgentConfig, isLoading, error: fetchError } = useFetchAgentConfig()
  // Update agent configuration
  const { updateAgentConfig, isSaving, error: updateError } = useUpdateAgentConfig()

  const error = fetchError || updateError 

  // Helper function to find scenario overview
  const getScenarioOverview = (scenarioId: string): string => {
    const scenario = scenarioTemplates.find(template => template.scenarioId === scenarioId)
    return scenario?.overview || 'No overview available'
  }

  // Helper function to find student profile prompt
  const getStudentProfilePrompt = (profileId: string): string => {
    const profile = simulatedStudentProfiles.find(profile => profile.id === profileId)
    return profile?.prompt || 'No profile prompt available'
  }

  // Helper function to get source lines for a component
  const getComponentSourceLines = (componentName: string): number[] => {
    if (!pedagogicalComponents) return []
    const component = pedagogicalComponents.find(comp => comp.name === componentName)
    return component?.sourceLines || []
  }

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

  // Generate remediation suggestions for failed tests
  const generateRemediationForResults = async (testResults: TestState[]): Promise<TestState[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (!testResults.length || !pedagogicalComponents) {
      return testResults
    }
    
    setIsGeneratingRemediation(true)
    
    const failedTests = testResults.filter(test => test.finalResult === 'failed')

    console.log(`🔍 Total tests: ${testResults.length}`)
  console.log(`🔍 Failed tests: ${failedTests.length}`)
  failedTests.forEach(test => {
    console.log(`  - ${test.testId}: ${test.componentName}`)
  })
      
    if (failedTests.length === 0) {
      console.log("No failed tests to remediate")
      setIsGeneratingRemediation(false)
      return testResults
    }
    
    console.log(`Generating remediation for ${failedTests.length} failed tests`)
    
    const remediationPromises = failedTests.map(async (failedTest): Promise<{ testId: string; remediation: any } | null> => {
      try {
        const component = pedagogicalComponents.find(comp => comp.name === failedTest.componentName)
        if (!component) {
          console.warn(`Component not found for test ${failedTest.testId}`)
          return null
        }
        
        const response = await fetch('/api/claude/prompt-remediation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            failedTest,
            currentPrompt: agentInfo?.prompt,
            pedagogicalComponent: component,
            conversationTranscript: failedTest.conversation
          })
        })
        
        if (!response.ok) {
          console.error(`Failed to generate remediation for test ${failedTest.testId}`)
          return null
        }
        
        const remediation = await response.json()
        return { testId: failedTest.testId, remediation }
      } catch (error) {
        console.error(`Error generating remediation for test ${failedTest.testId}:`, error)
        return null
      }
    })
    
    const remediationResults = await Promise.all(remediationPromises)
    const validRemediations = remediationResults.filter((r): r is { testId: string; remediation: any } => r !== null)
    
    // Update test results with remediation suggestions
    const updatedResults = testResults.map(test => {
      const remediationResult = validRemediations.find(r => r.testId === test.testId)
      if (remediationResult) {
        return {
          ...test,
          remediationSuggestion: remediationResult.remediation
        }
      }
      return test
    })
    
    console.log(`Generated remediation for ${validRemediations.length} failed tests`)
    setIsGeneratingRemediation(false)
    
    return updatedResults
  }

  const handleRunTests = async (rerunFailedOnly: boolean = false) => {
    setActiveTab("validation")
    setIsRunningTests(true)
    setIsRerunning(rerunFailedOnly)
    setCurrentStep(0)

    try {
      let decompositionData = null
      let testCases = null

      if (rerunFailedOnly && lastTestRun && enhancedTestResults.length > 0) {
        // Use cached data for rerun
        decompositionData = lastTestRun.decompositionData
        
        // Filter only failed test cases
        const failedTestIds = enhancedTestResults
          .filter(result => result.finalResult === 'failed')
          .map(result => result.testId)
        
        testCases = lastTestRun.allTestCases.filter(testCase => 
          failedTestIds.includes(testCase.testId)
        )
        
        console.log(`Rerunning ${testCases.length} failed tests out of ${lastTestRun.allTestCases.length} total`)
        
        // Skip decomposition and unit test generation steps
        setCurrentStep(2)
      } else {
        // Full test run - do decomposition and unit test generation
        
        // Step 1: Decomposing Prompt
        setCurrentStep(0)
        console.log("Starting pedagogical decomposition...")
        
        if (agentInfo?.prompt) {
          const decompositionResponse = await fetch('/api/claude/pedagogical-decomposition', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              instructorPrompt: agentInfo.prompt
            })
          })

          if (!decompositionResponse.ok) {
            throw new Error(`Decomposition failed: ${decompositionResponse.statusText}`)
          }

          decompositionData = await decompositionResponse.json()
          setPedagogicalComponents(decompositionData.pedagogicalComponents)
          console.log("Pedagogical components identified:", decompositionData.pedagogicalComponents)
        }

        // Step 2: Generating Unit Tests
        setCurrentStep(1)
        console.log("Generating unit tests...")
        
        if (decompositionData?.pedagogicalComponents) {
          const unitTestResponse = await fetch('/api/claude/unit-test-generation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pedagogicalComponents: decompositionData.pedagogicalComponents,
              studentProfiles: simulatedStudentProfiles, 
              scenarioTemplates: scenarioTemplates
            })
          })

          if (!unitTestResponse.ok) {
            throw new Error(`Unit test generation failed: ${unitTestResponse.statusText}`)
          }

          const unitTestData = await unitTestResponse.json()
          testCases = unitTestData.testCases
          console.log("Unit tests generated:", unitTestData.summary)
          console.log("Test cases:", testCases)
          
          // Cache the full test run data
          setLastTestRun({
            decompositionData,
            allTestCases: testCases,
            timestamp: Date.now()
          })
        }
      }

      // Step 2.5: Prepare test data for ElevenLabs execution
      console.log("Preparing test execution data...")
      
      const preparedTestData = testCases?.map((testCase: any) => {
        // Find the matching student profile
        const studentProfile = simulatedStudentProfiles.find(
          profile => profile.id === testCase.selectedProfileId
        )
        
        // Find the matching scenario
        const scenario = scenarioTemplates.find(
          template => template.scenarioId === testCase.selectedScenarioId
        )
        
        if (!studentProfile || !scenario) {
          console.warn(`Missing data for test ${testCase.testId}:`, {
            profileFound: !!studentProfile,
            scenarioFound: !!scenario
          })
          return null
        }

        return {
          testId: testCase.testId,
          componentName: testCase.componentName,
          
          // ElevenLabs simulation configuration
          simulatedUserConfig: {
            prompt: {
              prompt: studentProfile.prompt,
              llm: 'claude-3-5-sonnet',
              temperature: 0.7,
            },
          },
          
          // Agent context (the dynamic variables)
          agentContext: {
            task_description: scenario.taskDescription,
            student_code: scenario.studentCode,
            execution_output: scenario.executionOutput
          },
          
          // Test execution details
          conversationStarter: testCase.conversationStarter,
          evaluationCriteria: testCase.evaluationCriteria,
          
          // Metadata for tracking
          selectedProfileId: testCase.selectedProfileId,
          selectedScenarioId: testCase.selectedScenarioId
        }
      }).filter(Boolean) // Remove any null entries
      
      setPreparedTests(preparedTestData)
      console.log(`Prepared ${preparedTestData?.length} tests for execution`)

      // Log all prepared tests as one object
      console.log("ALL PREPARED TESTS:", {
        totalTests: preparedTestData?.length,
        tests: preparedTestData
      })
      
      // Step 3: Running test cases with ElevenLabs
      setCurrentStep(2)
      console.log("Executing test cases with ElevenLabs...")

      const simulationResponse = await fetch('/api/elevenlabs/simulate-conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentInfo?.agent_id,
          preparedTests: preparedTestData
        })
      })

      if (!simulationResponse.ok) {
        throw new Error(`Simulation failed: ${simulationResponse.statusText}`)
      }

      const simulationData = await simulationResponse.json()
      console.log("Simulation results:", simulationData.summary)
      console.log("Detailed results:", simulationData.results)

      // Step 4: Create enhanced test results
      const enhancedResults: TestState[] = simulationData.results.map((result: any) => {
        const evaluationResults = result.evaluationResults || result.analysis?.evaluationCriteriaResults || {}
        const finalResult = Object.values(evaluationResults).every((res: any) => res.result === 'success') ? 'passed' : 'failed'
        
        // Use decompositionData directly instead of state
        const getSourceLinesForComponent = (componentName: string): number[] => {
          if (!decompositionData?.pedagogicalComponents) return []
          const component = decompositionData.pedagogicalComponents.find((comp: any) => comp.name === componentName)
          return component?.sourceLines || []
        }
        
        return {
          testId: result.testId,
          testName: result.componentName,
          componentName: result.componentName,
          evaluationResults,
          sourceLines: getSourceLinesForComponent(result.componentName),
          selectedProfileId: result.selectedProfileId || '',
          selectedScenarioId: result.selectedScenarioId || '',
          scenarioOverview: getScenarioOverview(result.selectedScenarioId || ''),
          studentProfilePrompt: getStudentProfilePrompt(result.selectedProfileId || ''),
          conversation: result.conversation || [],
          finalResult,
          transcriptSummary: result.analysis?.transcriptSummary,
          callSuccessful: result.analysis?.callSuccessful
        }
      })

      // Handle merging results for reruns or replacing for full runs
      let finalResults: TestState[]

      if (rerunFailedOnly) {
        // Merge rerun results with existing results
        const updatedResults = [...enhancedTestResults]
        enhancedResults.forEach(newResult => {
          const existingIndex = updatedResults.findIndex(existing => existing.testId === newResult.testId)
          if (existingIndex >= 0) {
            updatedResults[existingIndex] = newResult
          }
        })
        finalResults = updatedResults
      } else {
        // Replace all results for full run
        finalResults = enhancedResults
      }

      console.log("ENHANCED TEST RESULTS:", rerunFailedOnly ? 'Updated with rerun results' : finalResults)

      setTestResults(simulationData.results) // Keep original for backward compatibility
      
      // Step 4: Remediating failures
      setCurrentStep(3)
      console.log("Analyzing results and generating remediation...")
      
      // Generate remediation and get the updated results
      const resultsWithRemediation = await generateRemediationForResults(finalResults)
      
      // Set the final enhanced results with remediation
      setEnhancedTestResults(resultsWithRemediation)

    } catch (error) {
      console.error("Error during test execution:", error)
    } finally {
      setIsRunningTests(false)
      setIsRerunning(false)
      setTestsRun(true)
    }
  }

  useEffect(() => {
    handleFetchConfig()
  }, [])

  useEffect(() => {
    if (agentInfo?.prompt) {
      console.log("=== PROMPT WITH LINE NUMBERS (from ConditionOnePage) ===")
      agentInfo.prompt.split("\n").forEach((line, index) => {
        console.log(`${index + 1}: ${line}`)
      })
      console.log("=========================================================")
    }
  }, [agentInfo?.prompt])

  return (
    <main className="wrapper-full min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm mt-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Prompt Validation Testing</h1>
              <p className="text-sm text-gray-500">AI-powered validation and testing for educational prompts</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Rerun Failed Tests Button */}
              {enhancedTestResults.length > 0 && enhancedTestResults.some(r => r.finalResult === 'failed') && (
                <Button
                  onClick={() => handleRunTests(true)}
                  disabled={isRunningTests || isLoading || !agentInfo?.agent_id}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isRerunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Rerunning Failed...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Rerun Failed ({enhancedTestResults.filter(r => r.finalResult === 'failed').length})
                    </>
                  )}
                </Button>
              )}
              
              {/* Run All Tests Button */}
              <Button
                onClick={() => handleRunTests(false)}
                disabled={isRunningTests || isLoading || !agentInfo?.agent_id}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2"
              >
                {isRunningTests && !isRerunning ? (
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
                    Run All Tests
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          {/* Main Content Card */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg ">
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
                  <ValidationInterfaceCondition1
                    isRunningTests={isRunningTests} 
                    currentStep={currentStep}
                    steps={steps}
                    agentInfo={agentInfo}
                    isSaving={isSaving}
                    onUpdateConfig={handleUpdateConfig}
                    testResults={testResults} 
                    enhancedTestResults={enhancedTestResults}
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