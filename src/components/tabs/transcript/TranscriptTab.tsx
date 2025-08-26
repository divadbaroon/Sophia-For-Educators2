import React from 'react'

import { TabsContent } from "@/components/ui/tabs"

import { useSimulation } from '@/lib/provider/replay-provider/ReplayProvider'

import { formatTimestamp } from '@/lib/utils/formatters'
import { getTimeFromStart } from '@/lib/utils/replay-provider/time-utils'

import { TranscriptTabProps } from './types'

export const TranscriptTab: React.FC<TranscriptTabProps> = ({ messages, sessionStartTime }) => {
  const { setCurrentTime } = useSimulation()

  const handleTimestampClick = (timestamp: string, rawTimestamp: string) => {
    // Calculate the time offset from session start
    const timeOffset = getTimeFromStart(rawTimestamp, sessionStartTime)
    
    // Jump to that time in the progress bar
    setCurrentTime(timeOffset)
    
    console.log('Timestamp clicked:', {
      formatted: timestamp,
      raw: rawTimestamp,
      sessionStart: sessionStartTime,
      calculatedOffset: timeOffset,
      jumpingTo: `${timeOffset}ms`
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
                  title="Click to jump to this time in the video"
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