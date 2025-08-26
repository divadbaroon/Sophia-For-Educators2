'use client'

import React, { useState, useEffect } from 'react'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { SessionHeader } from '@/components/SessionHeader'
import { VideoPlayer } from '@/components/VideoPlayer'
import { TranscriptTab } from '@/components/tabs/transcript/TranscriptTab'
import { CodeProgressTab } from '@/components/tabs/progress/CodeProgressTab'
import { ActivityTab } from '@/components/tabs/activity/ActivityTab'
import { EmotionTab } from '@/components/tabs/emotion/EmotionTab'
import { StatsTab } from '@/components/tabs/stats/StatsTab'

import { fetchSessionReplayData } from '@/lib/actions/getAllSessionData'
import { SessionReplayData, VideoDetailsPageProps } from "@/types"

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

  return (
    <main className="wrapper page">
      <SessionHeader conceptId={conceptId} sessionInfo={sessionInfo} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VideoPlayer 
          sessionData={sessionData} 
        />

        <div className="lg:col-span-1">
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="transcript" className="text-xs">Transcript</TabsTrigger>
              <TabsTrigger value="code" className="text-xs">Progress</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
              <TabsTrigger value="emotion" className="text-xs">Emotion</TabsTrigger>
              <TabsTrigger value="stats" className="text-xs">Stats</TabsTrigger>
            </TabsList>

            <TranscriptTab 
              messages={sessionData.messages} 
              sessionStartTime={sessionInfo.started_at} 
            />
            
            <CodeProgressTab 
              codeSnapshots={sessionData.codeSnapshots}
              testResults={sessionData.testResults}
              codeErrors={sessionData.codeErrors}
              taskProgress={sessionData.taskProgress}
              sessionStartTime={sessionInfo.started_at}
            />
            
            <ActivityTab 
              navigationEvents={sessionData.navigationEvents}
              sophiaButtonInteractions={sessionData.sophiaButtonInteractions}
              sophiaHighlights={sessionData.sophiaHighlights}
              userHighlights={sessionData.userHighlights}
              strokeData={sessionData.strokeData}
              sessionStartTime={sessionInfo.started_at}
            />

            <EmotionTab 
              emotionAnalysis={sessionData.emotionAnalysis}
              sophiaConversations={sessionData.sophiaConversations}
              sessionStartTime={sessionInfo.started_at}
            />
            
            <StatsTab 
              sessionInfo={sessionInfo}
              messages={sessionData.messages}
              codeSnapshots={sessionData.codeSnapshots}
              testResults={sessionData.testResults}
              taskProgress={sessionData.taskProgress}
            />
          </Tabs>
        </div>
      </div>
    </main>
  )
}

export default VideoDetailsPage