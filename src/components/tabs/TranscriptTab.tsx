import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { formatTimestamp } from '@/lib/utils/formatters'

interface TranscriptTabProps {
  messages: Array<{
    id: string
    created_at: string
    role: string
    content: string
  }>
  sessionStartTime: string
}

export const TranscriptTab: React.FC<TranscriptTabProps> = ({ messages, sessionStartTime }) => {
  return (
    <TabsContent value="transcript" className="mt-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="space-y-3 text-sm">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div key={message.id}>
              <span className="text-pink-500 font-medium">
                [{formatTimestamp(message.created_at, sessionStartTime)}]
              </span>
              <span className="text-gray-600 ml-2">
                <strong>{message.role}:</strong> {message.content}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No messages found for this session.</p>
        )}
      </div>
    </TabsContent>
  )
}