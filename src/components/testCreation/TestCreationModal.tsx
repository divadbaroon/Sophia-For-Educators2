"use client";

import { useState, useEffect, useRef } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import ExampleSection from "@/components/testCreation/ExampleSection";
import ChatPreview from "@/components/testCreation/chatPreview";

import { useExampleList } from "@/lib/hooks/testCreation/useExampleList";
import { useChatMessages } from "@/lib/hooks/testCreation/useChatMessages";

import { parsePrimitive, createInitialDynamicVars, createInitialMessages } from "@/lib/utils/testCreation/testDataHelpers";

import { TestCreationModalProps } from "./types"

export function TestCreationModal({ 
  isOpen, 
  onClose, 
  onSave, 
  agentFirstMessage, 
  initialData 
}: TestCreationModalProps) {
  // Basic form state
  const [testName, setTestName] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [dynamicVars, setDynamicVars] = useState(createInitialDynamicVars());
  const [hasSavedSinceOpen, setHasSavedSinceOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  // Custom hooks for complex state
  const successExamples = useExampleList();
  const failureExamples = useExampleList();
  const chatMessages = useChatMessages();

  const messagesScrollRef = useRef<HTMLDivElement | null>(null);

  // Reset save tracking when modal opens
  useEffect(() => {
    if (isOpen) setHasSavedSinceOpen(false);
  }, [isOpen]);

  // Initialize form data
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setTestName(initialData.testName || "");
      setSuccessCriteria(initialData.successCriteria || "");
      successExamples.setItems(initialData.successExamples || []);
      failureExamples.setItems(initialData.failureExamples || []);
      setDynamicVars(createInitialDynamicVars(initialData.dynamicVariables));
      
      const messages = initialData.chatMessages?.length > 0 
        ? initialData.chatMessages 
        : createInitialMessages(agentFirstMessage);
      chatMessages.setMessages(messages);
    } else {
      // Reset for create mode
      setTestName("");
      setSuccessCriteria("");
      successExamples.setItems([]);
      failureExamples.setItems([]);
      setDynamicVars(createInitialDynamicVars());
      chatMessages.setMessages(createInitialMessages(agentFirstMessage));
    }
  }, [isOpen, initialData, agentFirstMessage]);

  // Auto-scroll chat
  useEffect(() => {
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
    }
  }, [chatMessages.messages]);

  // Update dynamic variable
  const updateDynamicVar = (key: string, value: string) => {
    setDynamicVars(prev => ({ ...prev, [key]: value }));
  };

  // Validation
  const hasUserMessage = chatMessages.messages.some(m => m.type === "user" && m.text.trim().length > 0);
  const hasValidExamples = successExamples.items.some(ex => ex.text.trim()) && 
                          failureExamples.items.some(ex => ex.text.trim());
  const isFormValid = testName.trim() && successCriteria.trim() && 
                     successExamples.items.length > 0 && failureExamples.items.length > 0 &&
                     hasValidExamples && hasUserMessage;

  const handleSave = () => {
    if (!hasUserMessage) return;

    const processedDynamicVars = Object.entries(dynamicVars).reduce((acc, [key, value]) => {
      acc[key] = parsePrimitive(value);
      return acc;
    }, {} as Record<string, any>);

    const testData = {
      id: initialData?.id,
      testName,
      successCriteria,
      successExamples: successExamples.items,
      failureExamples: failureExamples.items,
      chatMessages: chatMessages.messages,
      dynamicVariables: processedDynamicVars,
    };

    setHasSavedSinceOpen(true);
    onSave(testData);
    onClose();
  };

  const requestClose = () => {
    if (!hasSavedSinceOpen) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  };

  const isEditMode = !!initialData;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && requestClose()}>
        <DialogContent className="min-w-[95vh] min-h-[55vh] overflow-y-auto w-[155vw]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Test" : "Create Test"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Test Name */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Test name</label>
                <Input
                  placeholder="Your test name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Success Criteria */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Success criteria</label>
                <Textarea
                  placeholder="Describe the ideal response or behavior..."
                  value={successCriteria}
                  onChange={(e) => setSuccessCriteria(e.target.value)}
                  rows={4}
                  className="w-full text-sm"
                />
              </div>

              {/* Success Examples */}
              <ExampleSection
                title="Success Examples"
                examples={successExamples.items}
                onAdd={successExamples.add}
                onRemove={successExamples.remove}
                onUpdate={successExamples.update}
                placeholder="Enter success example..."
              />

              {/* Failure Examples */}
              <ExampleSection
                title="Failure Examples"
                examples={failureExamples.items}
                onAdd={failureExamples.add}
                onRemove={failureExamples.remove}
                onUpdate={failureExamples.update}
                placeholder="Enter failure example..."
              />

              {/* Dynamic Variables */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-3 block">Dynamic variables</label>
                <div className="space-y-2">
                  {Object.entries(dynamicVars).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <Input value={key} readOnly className="w-1/3" />
                      <Input
                        value={value}
                        onChange={(e) => updateDynamicVar(key, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Chat Preview */}
            <ChatPreview
              messages={chatMessages.messages}
              onAddUser={chatMessages.addUser}
              onAddAgent={chatMessages.addAgent}
              onUpdateMessage={chatMessages.update}
              onRemoveLast={chatMessages.removeLast}
              messagesRef={messagesScrollRef}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={requestClose}>Back</Button>
            <Button 
              onClick={handleSave}
              disabled={!isFormValid}
              title={!hasUserMessage ? "Add at least one user message to save" : ""}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {isEditMode ? 'Update Test' : 'Save Test'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't saved this test. If you close now, your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmCloseOpen(false)}>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmCloseOpen(false); onClose(); }}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}