import React from 'react'

import { TabsContent } from "@/components/ui/tabs"

import { formatDuration } from '@/lib/utils/formatters'

import { StatsTabProps } from './types'

export const StatsTab: React.FC<StatsTabProps> = ({ 
  sessionInfo, 
  messages, 
  codeSnapshots, 
  testResults, 
  taskProgress 
}) => {
  return (
    <TabsContent value="stats" className="mt-4">
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-gray-800">Duration</h4>
            <p className="text-lg">
              {sessionInfo.duration_ms ? formatDuration(sessionInfo.duration_ms) : 'Unknown'}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-gray-800">Status</h4>
            <p className="text-lg capitalize">{sessionInfo.status}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-gray-800">Messages</h4>
            <p className="text-lg">{messages.length}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-gray-800">Code Changes</h4>
            <p className="text-lg">{codeSnapshots.length}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-gray-800">Test Runs</h4>
            <p className="text-lg">{testResults.length}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-gray-800">Tasks</h4>
            <p className="text-lg">
              {taskProgress.filter(t => t.completed).length}/{taskProgress.length}
            </p>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}