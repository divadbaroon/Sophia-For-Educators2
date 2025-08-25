'use client'

import React, { useState } from 'react'
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
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="lg:col-span-2">
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-teal-600 rounded-lg overflow-hidden aspect-video">
        <div 
          className="absolute inset-4 bg-gray-900 rounded-lg overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Simulation content area - scaled down to fit video dimensions */}
          <div className="relative h-full bg-gray-900 overflow-hidden">
            <SimulationProvider initialSessionData={sessionData}>
              {/* Main workspace */}
              <div className="relative h-full transform scale-50 origin-top-left" style={{ width: '200%', height: '200%' }}>
                <div className="h-full">
                  <SimulationWorkspaceLayout />
                </div>
              </div>
              
              {/* Progress bar overlay - appears on hover */}
              <div className={`absolute bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
                isHovered 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-2 pointer-events-none'
              }`}>
                <div className="bg-black/80 backdrop-blur-sm p-4 rounded-t-lg">
                  <SimulationProgressBar />
                </div>
              </div>
            </SimulationProvider>
          </div>
        </div>
      </div>
    </div>
  )
}