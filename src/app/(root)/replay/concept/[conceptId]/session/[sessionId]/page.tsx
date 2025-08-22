'use client'

import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play } from "lucide-react"
import { fetchSessionReplayData} from '@/lib/actions/getAllSessionData'

import { SessionReplayData } from "@/types"

interface VideoDetailsPageProps {
  params: Promise<{
    conceptId: string
    sessionId: string
  }>
}

const VideoDetailsPage = ({ params }: VideoDetailsPageProps) => {
  const { conceptId, sessionId } = React.use(params)
  const [sessionData, setSessionData] = useState<SessionReplayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const result = await fetchSessionReplayData(sessionId)
        
        if (result.success && result.data) {
          console.log('✅ Session Data Loaded:', result.data.sessionInfo)
          console.log('🔍 Raw started_at:', result.data.sessionInfo.started_at)
          console.log('📊 Data Summary:', {
            messages: result.data.messages.length,
            codeSnapshots: result.data.codeSnapshots.length,
            testResults: result.data.testResults.length,
            taskProgress: result.data.taskProgress.length,
            strokeData: result.data.strokeData.length,
            navigationEvents: result.data.navigationEvents.length,
            sophiaHighlights: result.data.sophiaHighlights.length,
            userHighlights: result.data.userHighlights.length,
            duration: result.data.sessionInfo.duration_ms
          })
          
          // Debug stroke data specifically
          if (result.data.strokeData.length > 0) {
            console.log('✏️ First stroke data entry:', result.data.strokeData[0])
          } else {
            console.log('⚠️ No stroke data found for this session')
          }
          
          setSessionData(result.data)
        } else {
          console.error('❌ Failed to load session data:', result.error)
          setError(result.error || 'Failed to load session data')
        }
      } catch (err) {
        console.error('💥 Error loading session:', err)
        setError('Error loading session data')
      } finally {
        setLoading(false)
      }
    }

    loadSessionData()
  }, [sessionId])

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: string, sessionStart: string) => {
    console.log('🕐 Timestamp calculation:', {
      timestamp,
      sessionStart,
    })
    
    // Normalize both to UTC - if sessionStart has no timezone, treat it as UTC
    const normalizedSessionStart = sessionStart.includes('+') || sessionStart.includes('Z') 
      ? sessionStart 
      : sessionStart + '+00:00'
    
    const sessionStartTime = new Date(normalizedSessionStart).getTime()
    const eventTime = new Date(timestamp).getTime()
    const diffMs = eventTime - sessionStartTime
    
    console.log('🕐 Time difference:', {
      normalizedSessionStart,
      sessionStartTime,
      eventTime,
      diffMs,
      diffSeconds: diffMs / 1000
    })
    
    // Handle negative values (events before session start)
    if (diffMs < 0) {
      console.log('⚠️ Negative timestamp detected, returning 00:00')
      return "00:00"
    }
    
    const minutes = Math.floor(diffMs / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)
    const result = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    
    console.log('🕐 Final timestamp:', result)
    return result
  }

  // Helper function to format duration
  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <main className="wrapper page">
        <div className="text-center py-8">Loading session data...</div>
      </main>
    )
  }

  if (error || !sessionData) {
    return (
      <main className="wrapper page">
        <div className="text-center py-8 text-red-600">
          Error: {error || 'Session not found'}
        </div>
      </main>
    )
  }

  const { sessionInfo } = sessionData

  const formatConceptTitle = (slug: string) => {
    return slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <main className="wrapper page">
      {/* Video Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {formatConceptTitle(conceptId)}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Avatar className="w-5 h-5">
              <AvatarImage src="/assets/images/dummy.jpg" />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <span>Student</span>
            <span>•</span>
            <span>{sessionInfo.status}</span>
            <span>•</span>
            <span>{sessionInfo.duration_ms ? formatDuration(sessionInfo.duration_ms) : 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Video Player and Data Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-teal-600 rounded-lg overflow-hidden aspect-video">
            {/* Simulated macOS window */}
            <div className="absolute inset-4 bg-gray-900 rounded-lg overflow-hidden">
              {/* macOS title bar */}
              <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-gray-400 text-xs">Learning Session Replay</span>
                </div>
              </div>

              {/* Video content area */}
              <div className="relative h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                {/* Play button */}
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                  <Play className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" />
                </div>

                {/* Video controls */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center gap-2">
                      <span className="bg-black/50 px-2 py-1 rounded">1x</span>
                    </div>
                    <span className="bg-black/50 px-2 py-1 rounded">
                      {sessionInfo.duration_ms ? formatDuration(sessionInfo.duration_ms) : '0:00'}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1 bg-white/30 rounded-full">
                    <div className="h-full w-1/4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* macOS dock simulation */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-white/30 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Panel */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="transcript" className="text-xs">
                Transcript
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs">
                Code Progress
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">
                Activity
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs">
                Stats
              </TabsTrigger>
            </TabsList>

            {/* Transcript Tab */}
            <TabsContent value="transcript" className="mt-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-3 text-sm">
                {sessionData.messages.length > 0 ? (
                  sessionData.messages.map((message) => (
                    <div key={message.id}>
                      <span className="text-pink-500 font-medium">
                        [{formatTimestamp(message.created_at, sessionInfo.started_at)}]
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

            {/* Code Progress Tab */}
            <TabsContent value="code" className="mt-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-3 text-sm">
                {/* Combine all code-related events and sort by timestamp */}
                {[
                  // Code snapshots
                  ...sessionData.codeSnapshots.map(snapshot => ({
                    timestamp: snapshot.created_at,
                    type: 'code_change',
                    description: `Code changed in Task ${snapshot.task_index}`,
                    details: `Method: ${snapshot.method_id}`
                  })),
                  // Test results
                  ...sessionData.testResults.map(test => ({
                    timestamp: test.created_at,
                    type: test.passed ? 'test_passed' : 'test_failed',
                    description: test.passed ? 
                      `✅ Test passed in Task ${test.task_index}` : 
                      `❌ Test failed in Task ${test.task_index}`,
                    details: test.error_message || `Test case ${test.test_case_index}`
                  })),
                  // Code errors
                  ...sessionData.codeErrors.map(error => ({
                    timestamp: error.created_at,
                    type: 'code_error',
                    description: `🚨 Code error in Task ${error.task_index}`,
                    details: error.error_message
                  }))
                ]
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((event, index) => (
                  <div key={index}>
                    <span className="text-pink-500 font-medium">
                      [{formatTimestamp(event.timestamp, sessionInfo.started_at)}]
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
                ))}
                
                {/* Show message if no code events */}
                {sessionData.codeSnapshots.length === 0 && 
                 sessionData.testResults.length === 0 && 
                 sessionData.codeErrors.length === 0 && 
                 sessionData.taskProgress.filter(t => t.completed).length === 0 && (
                  <p className="text-gray-500">No code activity found for this session.</p>
                )}
              </div>
            </TabsContent>

            {/* Activity Timeline Tab */}
            <TabsContent value="activity" className="mt-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-3 text-sm">
                {/* Combine and sort all activity events */}
                {[
                  // Navigation events
                  ...sessionData.navigationEvents.map(event => ({
                    timestamp: event.timestamp,
                    type: 'navigation',
                    description: `🧭 Navigated from Task ${event.from_task_index} to Task ${event.to_task_index}`,
                    details: `Direction: ${event.navigation_direction}`
                  })),
                  
                  // Sophia button interactions
                  ...sessionData.sophiaButtonInteractions.map(event => ({
                    timestamp: event.timestamp,
                    type: 'sophia_button',
                    description: `🤖 Sophia ${event.interaction_type} interaction`,
                    details: `At Task ${event.current_task_index}`
                  })),
                  
                  // Sophia highlights
                  ...sessionData.sophiaHighlights.map(event => ({
                    timestamp: event.highlighted_at,
                    type: 'sophia_highlight',
                    description: `💡 Sophia highlighted code`,
                    details: `Line ${event.line_number}`
                  })),
                  
                  // User highlights
                  ...sessionData.userHighlights.map(event => ({
                    timestamp: event.highlighted_at,
                    type: 'user_highlight',
                    description: `🔦 User highlighted text`,
                    details: event.highlighted_text.length > 50 ? 
                      event.highlighted_text.substring(0, 50) + '...' : 
                      event.highlighted_text
                  })),
                  
                  // Stroke data (drawing interactions)
                  ...sessionData.strokeData.map(event => ({
                    timestamp: event.created_at,
                    type: 'stroke',
                    description: `✏️ Drew stroke ${event.stroke_number} in ${event.zone}`,
                    details: `${event.point_count} points`
                  }))
                ]
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((activity, index) => (
                  <div key={index}>
                    <span className="text-pink-500 font-medium">
                      [{formatTimestamp(activity.timestamp, sessionInfo.started_at)}]
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
                ))}
                
                {/* Show message if no activity */}
                {sessionData.navigationEvents.length === 0 && 
                 sessionData.sophiaButtonInteractions.length === 0 && 
                 sessionData.sophiaHighlights.length === 0 && 
                 sessionData.userHighlights.length === 0 && 
                 sessionData.strokeData.length === 0 && (
                  <p className="text-gray-500">No activity events found for this session.</p>
                )}
              </div>
            </TabsContent>

            {/* Session Stats Tab */}
            <TabsContent value="stats" className="mt-4">
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-800">Duration</h4>
                    <p className="text-lg">{sessionInfo.duration_ms ? formatDuration(sessionInfo.duration_ms) : 'Unknown'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-800">Status</h4>
                    <p className="text-lg capitalize">{sessionInfo.status}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-800">Messages</h4>
                    <p className="text-lg">{sessionData.messages.length}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-800">Code Changes</h4>
                    <p className="text-lg">{sessionData.codeSnapshots.length}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-800">Test Runs</h4>
                    <p className="text-lg">{sessionData.testResults.length}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-800">Tasks</h4>
                    <p className="text-lg">
                      {sessionData.taskProgress.filter(t => t.completed).length}/
                      {sessionData.taskProgress.length}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

export default VideoDetailsPage