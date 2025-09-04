import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { Settings, Save, Edit } from "lucide-react";

import { AgentConfigurationProps } from "./types";

export function AgentConfiguration({ 
  agentInfo, 
  isLoading, 
  isSaving, 
  onUpdateConfig, 
  onRefresh 
}: AgentConfigurationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [editedFirstMessage, setEditedFirstMessage] = useState("");

  useEffect(() => {
    if (agentInfo) {
      setEditedPrompt(agentInfo.prompt);
      setEditedFirstMessage(agentInfo.first_message);
    }
  }, [agentInfo]);

  const handleUpdateConfig = async () => {
    if (!agentInfo) return;

    const updatedAgentData = await onUpdateConfig(
      editedPrompt,
      editedFirstMessage
    );

    if (updatedAgentData) {
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (agentInfo) {
      setEditedPrompt(agentInfo.prompt);
      setEditedFirstMessage(agentInfo.first_message);
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    handleUpdateConfig();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Agent Configuration
            </CardTitle>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={!agentInfo || isLoading}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={isSaving || !editedPrompt.trim()}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <hr className="border-gray-200 mb-6" />

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">Loading agent configuration...</span>
              </div>
            </div>
          ) : agentInfo ? (
            <div className="space-y-6">
              {/* First Message */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">First Message</label>
                {isEditing ? (
                  <Textarea
                    value={editedFirstMessage}
                    onChange={(e) => setEditedFirstMessage(e.target.value)}
                    placeholder="Enter the initial greeting message (optional)"
                    className="text-sm"
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-900">
                      {agentInfo.first_message || <em className="text-gray-500">No first message set</em>}
                    </span>
                  </div>
                )}
                <span className="text-xs text-gray-500 mt-1 block">
                  The initial greeting message the agent sends to start conversations
                </span>
              </div>

              {/* Current Prompt */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Current Prompt</label>
                {isEditing ? (
                  <Textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    placeholder="Enter agent prompt"
                    className="text-sm min-h-[200px] font-mono"
                    rows={10}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">
                      {agentInfo.prompt}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}