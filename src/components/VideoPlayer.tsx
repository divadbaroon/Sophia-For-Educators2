'use client'

import React from 'react'
import { SimulationWorkspaceLayout } from "@/components/replay/replay-work-space/ReplayWorkSpace"
import { SimulationProgressBar } from "@/components/replay/replay-playback-controller/ReplayPlaybackController"
import { SimulationProvider } from '@/lib/provider/replay-provider/ReplayProvider'
import { SessionReplayData } from "@/types"

interface VideoPlayerProps {
  sessionData?: SessionReplayData | null  
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  sessionData 
}) => {
  return (
    <div className="lg:col-span-2">
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-teal-600 rounded-lg overflow-hidden aspect-video">
        <div className="absolute inset-4 bg-gray-900 rounded-lg overflow-hidden">
          {/* Simulation content area - scaled down to fit video dimensions */}
          <div className="relative h-full bg-gray-900 overflow-hidden">
            <SimulationProvider initialSessionData={sessionData}>
              <div className="relative h-full transform scale-50 origin-top-left" style={{ width: '200%', height: '200%' }}>
                {/* Main workspace */}
                <div className="h-full pb-24">
                  <SimulationWorkspaceLayout />
                </div>
                
                {/* Progress bar */}
                <SimulationProgressBar />
              </div>
            </SimulationProvider>
          </div>
        </div>
      </div>
    </div>
  )
}