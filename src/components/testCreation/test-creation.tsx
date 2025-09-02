"use client";

import { useState, useEffect } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { PromptPanel } from "@/components/promptSidePanel/prompt-panel";
import { TestCreationModal } from "@/components/testCreation/TestCreationModal";

import { Edit } from "lucide-react";

import { useCreateTest } from "@/lib/hooks/tests/useAgentTesting";

import {
  loadSavedTests,
  // removeSavedTest, // optional if you want a delete
  type SavedTest,
} from "@/lib/storage/tests";

import { TestCreationProps } from "./types";

export const TestCreation = ({
  agentInfo,
  isLoading,
  isSaving = false,
  onUpdateConfig,
  onRefresh,
}: TestCreationProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedTests, setSavedTests] = useState<SavedTest[]>([]);

  const { createTest, isCreating, error: createError } = useCreateTest();

  useEffect(() => {
    setSavedTests(loadSavedTests());
  }, []);

  const handlePromptSave = async (newPrompt: string) => {
    if (!agentInfo) return;
    await onUpdateConfig(agentInfo.name, newPrompt, agentInfo.first_message);
  };

  const handleTestSave = async (testData: any) => {
    const created = await createTest({
      ...testData,
      chatMessages: testData.chatMessages || [],
      dynamicVariables: testData.dynamicVariables || {},
    });

    if (created) {
      setSavedTests(loadSavedTests());
      setIsModalOpen(false);
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

      {/* Right Panel - Saved Tests */}
      <div className="w-1/2 flex flex-col">
        <div className="p-4 border-b border-border bg-card -mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">Test Creation</h2>
            <Button
              className="bg-black text-white hover:bg-gray-800 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              disabled={!agentInfo || isLoading || isCreating}
            >
              {isCreating ? "Creating Test..." : "Create a Test"}
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

        {/* Saved Tests List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {savedTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
              <p className="mb-3">No tests yet.</p>
              <Button
                className="bg-black text-white hover:bg-gray-800"
                onClick={() => setIsModalOpen(true)}
                disabled={!agentInfo || isLoading || isCreating}
              >
                Create your first test
              </Button>
            </div>
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
                          onClick={() => console.log("Edit test:", t.id)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit Test Case
                        </Button>
                        {/* Optional Delete:
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            removeSavedTest(t.id);
                            setSavedTests(loadSavedTests());
                          }}
                        >
                          Delete
                        </Button> */}
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
        onClose={() => setIsModalOpen(false)}
        onSave={handleTestSave}
        agentFirstMessage={agentInfo?.first_message}
      />
    </div>
  );
};
