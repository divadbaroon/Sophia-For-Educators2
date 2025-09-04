"use client";

import { useState, useEffect } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { TestCreationModal } from "@/components/testCreation/TestCreationModal";
import { PromptPanel } from "@/components/promptSidePanel/prompt-panel";

import { Edit } from "lucide-react";

import { useCreateTest, useFetchTest, useUpdateTest } from "@/lib/hooks/tests/useAgentTesting";

import { mapChatMessagesToConversation } from "@/lib/utils/data-formatter"

import {
  loadSavedTests,
  addSavedTest,
  removeSavedTest,
  updateSavedTest,
  type SavedTest,
} from "@/lib/storage/tests";

import type { TestCreationProps} from "./types";

export const TestCreation = ({
  agentInfo,
  isLoading,
  isSaving = false,
  onUpdateConfig,
  onRefresh,
}: TestCreationProps) => {

  // controls modal open status 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tracks which test is being edited 
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  // Stores the fetched data for pre-populating the modal.
  const [editingTestData, setEditingTestData] = useState<any>(null);

  // local array of saved tests, synced with localStorage
  const [savedTests, setSavedTests] = useState<SavedTest[]>([]);

  // Hook used to create tests
  const { createTest, isCreating, error: createError } = useCreateTest();
  // Hook used to fetch tests
  const { fetchTest, isLoading: isFetchingTest } = useFetchTest();
  // Hooks used to update tests
  const { updateTest, isUpdating, error: updateError } = useUpdateTest();

  // loads saved tests on mount from localStorage
  useEffect(() => {
    setSavedTests(loadSavedTests());
  }, []);

  // Allows user to save prompt changes ( on left hand panel )
  const handlePromptSave = async (newPrompt: string) => {
    if (!agentInfo) return;
    await onUpdateConfig(agentInfo.name, newPrompt, agentInfo.first_message);
  };

  // Handles both test creation and updating
  const handleTestSave = async (testData: any) => {
    // Prepare the data
    const fullTestData = {
      ...testData,
      chatMessages: testData.chatMessages || [],
      dynamicVariables: testData.dynamicVariables || {},
    };

    // Transforms modal's chat format to storage format for localStorage.
    const conversation = mapChatMessagesToConversation(fullTestData.chatMessages);

    // For if we are updating existing test 
    if (editingTestId) {
      // Update existing test 
      const updatedTest = await updateTest(editingTestId, fullTestData);

      if (updatedTest) {
        // Update in localStorage
        updateSavedTest({
          id: editingTestId,
          title: testData.testName,
          description: (testData.successCriteria || "").slice(0, 100) + "...",
          createdAt: new Date().toISOString(),
          conversation, 
        });

        setSavedTests(loadSavedTests());
        setEditingTestId(null);
        setEditingTestData(null);
        setIsModalOpen(false);
      }
    } else {
      // Else we are creating a test case 

      // Create new test 
      const createdTest = await createTest(fullTestData);

      if (createdTest) {
        // Build saved tests object if successfully created
        const saved: SavedTest = {
          id: createdTest.id,
          title: testData.testName,
          description: (testData.successCriteria || "").slice(0, 100) + "...",
          createdAt: new Date().toISOString(),
          conversation, 
        };

        // Save to local storage
        addSavedTest(saved);
        setSavedTests(loadSavedTests());
        setIsModalOpen(false);
      }
    }
  };

  const handleEditTest = async (testId: string) => {

    // Fetch the full test data from ElevenLabs
    const testData = await fetchTest(testId);

    if (testData) {
      // Transform ElevenLabs payload -> modal format
      const transformedData = {
        id: testData.id,
        testName: testData.name,
        successCriteria: testData.success_condition || testData.successCondition,
        successExamples: (testData.success_examples || testData.successExamples || []).map((ex: any, idx: number) => ({
          id: `success-${idx}`,
          text: ex.response || ex.text || "",
        })),
        failureExamples: (testData.failure_examples || testData.failureExamples || []).map((ex: any, idx: number) => ({
          id: `failure-${idx}`,
          text: ex.response || ex.text || "",
        })),
        chatMessages: (testData.chat_history || testData.chatHistory || []).map((msg: any, idx: number) => ({
          id: `msg-${idx}`,
          type: msg.role === "user" ? "user" : "agent",
          text: msg.message || msg.text || "",
        })),
        dynamicVariables: testData.dynamic_variables || testData.dynamicVariables || {},
      };

      setEditingTestId(testId);
      setEditingTestData(transformedData);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTestId(null);
    setEditingTestData(null);
  };

  const combinedError = createError || updateError;
  const isAnyOperationLoading = isLoading || isCreating || isFetchingTest || isUpdating;

  return (
    <div className="flex h-full bg-background">
      {/* Left Panel - Prompt Display */}
      <div className="w-1/2 border-r border-border">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Loading agent configuration...</span>
            </div>
          </div>
        ) : agentInfo ? (
          <PromptPanel
            promptData={{
              content: agentInfo.prompt ? agentInfo.prompt.split("\n") : [],
            }}
            onPromptSave={handlePromptSave}
            isSaving={isSaving}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-8 text-gray-500">
              <p>Failed to load agent configuration.</p>
              <Button onClick={onRefresh} variant="outline" size="sm" className="mt-2">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Test Cases Display */}
      <div className="w-1/2 flex flex-col">
        <div className="p-4 border-b border-border bg-card -mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">Test Creation</h2>
            <Button
              className="bg-black text-white hover:bg-gray-800 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              disabled={!agentInfo || isAnyOperationLoading}
            >
              {isCreating ? "Creating Test..." : isUpdating ? "Updating Test..." : "Create a Test"}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {combinedError && (
          <div className="mx-4 mt-4">
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              <strong>Error:</strong> {combinedError}
            </div>
          </div>
        )}

        {/* Loading indicator for fetching test */}
        {isFetchingTest && (
          <div className="mx-4 mt-4">
            <div className="text-blue-600 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
              Loading test data for editing...
            </div>
          </div>
        )}

        {/* Loading indicator for updating test */}
        {isUpdating && (
          <div className="mx-4 mt-4">
            <div className="text-blue-600 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
              Updating test...
            </div>
          </div>
        )}

        {/* Saved Tests List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {savedTests.length === 0 ? (
            <div className="text-sm text-gray-500">No tests yet. Create your first test to see it here.</div>
          ) : (
            savedTests.map((t) => (
              <Card key={t.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-medium mb-2 flex items-center gap-2">
                        {t.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mb-3">{t.description}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer hover:bg-gray-100 bg-transparent text-foreground hover:text-foreground"
                          onClick={() => handleEditTest(t.id)}
                          disabled={isAnyOperationLoading}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit Test Case
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Remove this test from your device?")) {
                              removeSavedTest(t.id);
                              setSavedTests(loadSavedTests());
                            }
                          }}
                          disabled={isAnyOperationLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Test Creation Modal */}
      <TestCreationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleTestSave}
        agentFirstMessage={agentInfo?.first_message}
        initialData={editingTestData}
      />
    </div>
  );
};
