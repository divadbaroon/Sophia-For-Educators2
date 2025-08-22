import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { formatTimestamp } from '@/lib/utils/formatters'

interface CodeEvent {
  timestamp: string
  type: string
  description: string
  details?: string
}

interface CodeProgressTabProps {
  codeSnapshots: any[]
  testResults: any[]
  codeErrors: any[]
  taskProgress: any[]
  sessionStartTime: string
}

export const CodeProgressTab: React.FC<CodeProgressTabProps> = ({ 
  codeSnapshots, 
  testResults, 
  codeErrors, 
  taskProgress, 
  sessionStartTime 
}) => {
  const handleTimestampClick = (timestamp: string, rawTimestamp: string, eventType: string) => {
    console.log('Code event timestamp clicked:', {
      formatted: timestamp,
      raw: rawTimestamp,
      eventType,
      sessionStart: sessionStartTime
    })
  }

  const codeEvents: CodeEvent[] = [
    ...codeSnapshots.map(snapshot => ({
      timestamp: snapshot.created_at,
      type: 'code_change',
      description: `Code changed in Task ${snapshot.task_index}`,
      details: `Method: ${snapshot.method_id}`
    })),
    ...testResults.map(test => ({
      timestamp: test.created_at,
      type: test.passed ? 'test_passed' : 'test_failed',
      description: test.passed ? 
        `✅ Test passed in Task ${test.task_index}` : 
        `❌ Test failed in Task ${test.task_index}`,
      details: test.error_message || `Test case ${test.test_case_index}`
    })),
    ...codeErrors.map(error => ({
      timestamp: error.created_at,
      type: 'code_error',
      description: `🚨 Code error in Task ${error.task_index}`,
      details: error.error_message
    }))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return (
    <TabsContent value="code" className="mt-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="space-y-3 text-sm">
        {codeEvents.length > 0 ? (
          codeEvents.map((event, index) => {
            const formattedTime = formatTimestamp(event.timestamp, sessionStartTime)
            return (
              <div key={index}>
                <span 
                  className="text-pink-500 font-medium cursor-pointer hover:text-pink-700 hover:underline"
                  onClick={() => handleTimestampClick(formattedTime, event.timestamp, event.type)}
                  title="Click to log timestamp info"
                >
                  [{formattedTime}]
                </span>
                <span className="text-gray-600 ml-2">
                  {event.description}
                </span>
                {event.details && (
                  <div className="text-xs text-gray-500 ml-8 mt-1">
                    {event.details}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-gray-500">No code activity found for this session.</p>
        )}
      </div>
    </TabsContent>
  )
}