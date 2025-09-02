"use client";

import { useState } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { PromptPanel } from "@/components/promptSidePanel/prompt-panel";
import { TestCreationModal } from "@/components/testCreation/TestCreationModal";

import { Edit } from "lucide-react";

import { feedbackData } from "@/lib/mock-data";
import { useCreateTest } from "@/lib/hooks/tests/useAgentTesting";

import { TestCreationProps } from "./types"

export const TestCreation = ({ 
  agentInfo, 
  isLoading,
  isSaving = false,
  onUpdateConfig,
  onRefresh 
}: TestCreationProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdTests, setCreatedTests] = useState<any[]>([]);

  const { createTest, isCreating, error: createError } = useCreateTest();

  const handlePromptSave = async (newPrompt: string) => {
    if (!agentInfo) return;
    
    // Use the existing agent name and first_message, but update the prompt
    await onUpdateConfig(
      agentInfo.name,
      newPrompt,
      agentInfo.first_message
    );
  };

  const handleTestSave = async (testData: any) => {
    console.log('💾 Saving test:', testData);
    
    // Add chat messages and dynamic variables to the test data
    const fullTestData = {
      ...testData,
      chatMessages: testData.chatMessages || [],
      dynamicVariables: testData.dynamicVariables || {}
    };

    const createdTest = await createTest(fullTestData);
    
    if (createdTest) {
      // Add the new test to our local list
      setCreatedTests(prev => [...prev, {
        id: createdTest.id,
        title: testData.testName,
        description: testData.successCriteria.substring(0, 100) + "..."
      }]);
      
      setIsModalOpen(false);
      console.log('✅ Test saved successfully with ID:', createdTest.id);
    } else {
      console.error('❌ Failed to create test:', createError);
    }
  };

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
              content: agentInfo.prompt ? agentInfo.prompt.split('\n') : []
            }}
            onPromptSave={handlePromptSave}
            isSaving={isSaving}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-8 text-gray-500">
              <p>Failed to load agent configuration.</p>
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Test Cases Display*/}
      <div className="w-1/2 flex flex-col">
        <div className="p-4 border-b border-border bg-card -mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">Test Creation</h2>
            <Button
              className="bg-black text-white hover:bg-gray-800 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              disabled={!agentInfo || isLoading || isCreating}
            >
              {isCreating ? 'Creating Test...' : 'Create a Test'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {createError && (
          <div className="mx-4 mt-4">
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              <strong>Error creating test:</strong> {createError}
            </div>
          </div>
        )}

        {/* Test Cases List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Show created tests first */}
          {createdTests.map((test) => (
            <Card key={test.id} className="border border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium mb-2 flex items-center gap-2">
                      {test.title}
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">NEW</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer hover:bg-green-100 bg-transparent text-foreground hover:text-foreground"
                      onClick={() => console.log('Edit test:', test.id)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit Test Case
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {/* Show existing mock tests */}
          {feedbackData.items.map((item, index) => (
            <Card key={index} className="border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium mb-2 flex items-center gap-2">
                      {item.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent text-foreground hover:text-foreground"
                      onClick={() => setIsModalOpen(true)}
                      disabled={!agentInfo || isLoading}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit Test Case
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Test Creation Modal */}
      <TestCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleTestSave}
        agentFirstMessage={agentInfo?.first_message}
      />
    </div>
  );
};