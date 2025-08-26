import React from 'react'

import { TabsContent } from "@/components/ui/tabs"

import { useSimulation } from '@/lib/provider/replay-provider/ReplayProvider'

import { formatTimestamp } from '@/lib/utils/formatters'
import { getTimeFromStart } from '@/lib/utils/replay-provider/time-utils'

import { ActivityEvent, ActivityTabProps } from './types'

export const ActivityTab: React.FC<ActivityTabProps> = ({ 
  navigationEvents,
  sophiaButtonInteractions,
  sophiaHighlights,
  userHighlights,
  strokeData,
  sessionStartTime 
}) => {
  const { setCurrentTime } = useSimulation()

  const handleTimestampClick = (timestamp: string, rawTimestamp: string, activityType: string) => {
    // Calculate the time offset from session start
    const timeOffset = getTimeFromStart(rawTimestamp, sessionStartTime)
    
    // Jump to that time in the progress bar
    setCurrentTime(timeOffset)
    
    console.log('Activity timestamp clicked:', {
      formatted: timestamp,
      raw: rawTimestamp,
      activityType,
      sessionStart: sessionStartTime,
      calculatedOffset: timeOffset,
      jumpingTo: `${timeOffset}ms`
    })
  }

  const activityEvents: ActivityEvent[] = [
    ...navigationEvents.map(event => ({
      timestamp: event.timestamp,
      type: 'navigation',
      description: `🧭 Navigated from Task ${event.from_task_index} to Task ${event.to_task_index}`,
      details: `Direction: ${event.navigation_direction}`
    })),
    ...sophiaButtonInteractions.map(event => ({
      timestamp: event.timestamp,
      type: 'sophia_button',
      description: `🤖 Sophia ${event.interaction_type} interaction`,
      details: `At Task ${event.current_task_index}`
    })),
    ...sophiaHighlights.map(event => ({
      timestamp: event.highlighted_at,
      type: 'sophia_highlight',
      description: `💡 Sophia highlighted code`,
      details: `Line ${event.line_number}`
    })),
    ...userHighlights.map(event => ({
      timestamp: event.highlighted_at,
      type: 'user_highlight',
      description: `🔦 User highlighted text`,
      details: event.highlighted_text.length > 50 ? 
        event.highlighted_text.substring(0, 50) + '...' : 
        event.highlighted_text
    })),
    ...strokeData.map(event => ({
      timestamp: event.created_at,
      type: 'stroke',
      description: `✏️ Drew stroke ${event.stroke_number} in ${event.zone}`,
      details: `${event.point_count} points`
    }))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return (
    <TabsContent value="activity" className="mt-4 space-y-4 max-h-96 overflow-y-auto">
      <div className="space-y-3 text-sm">
        {activityEvents.length > 0 ? (
          activityEvents.map((activity, index) => {
            const formattedTime = formatTimestamp(activity.timestamp, sessionStartTime)
            return (
              <div key={index}>
                <span 
                  className="text-pink-500 font-medium cursor-pointer hover:text-pink-700 hover:underline"
                  onClick={() => handleTimestampClick(formattedTime, activity.timestamp, activity.type)}
                  title="Click to jump to this time in the video"
                >
                  [{formattedTime}]
                </span>
                <span className="text-gray-600 ml-2">
                  {activity.description}
                </span>
                {activity.details && (
                  <div className="text-xs text-gray-500 ml-8 mt-1">
                    {activity.details}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-gray-500">No activity events found for this session.</p>
        )}
      </div>
    </TabsContent>
  )
}