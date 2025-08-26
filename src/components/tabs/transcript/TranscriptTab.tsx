import React from 'react'

import { TabsContent } from "@/components/ui/tabs"

import { formatTimestamp } from '@/lib/utils/formatters'

import { TranscriptTabProps } from './types'

export const TranscriptTab: React.FC<TranscriptTabProps> = ({ messages, sessionStartTime }) => {
  const handleTimestampClick = (timestamp: string, rawTimestamp: string) => {
    console.log('Timestamp clicked:', {
      formatted: timestamp,
      raw: rawTimestamp,
      sessionStart: sessionStartTime
    })
  }

  return (
    <TabsContent value="transcript" className="mt-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="space-y-3 text-sm">
        {messages.length > 0 ? (
          messages.map((message) => {
            const formattedTime = formatTimestamp(message.created_at, sessionStartTime)
            return (
              <div key={message.id}>
                <span 
                  className="text-pink-500 font-medium cursor-pointer hover:text-pink-700 hover:underline"
                  onClick={() => handleTimestampClick(formattedTime, message.created_at)}
                  title="Click to log timestamp info"
                >
                  [{formattedTime}]
                </span>
                <span className="text-gray-600 ml-2">
                  <strong>{message.role}:</strong> {message.content}
                </span>
              </div>
            )
          })
        ) : (
          <p className="text-gray-500">No messages found for this session.</p>
        )}
      </div>
    </TabsContent>
  )
}