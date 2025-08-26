'use client'

import { useState } from 'react'

import { SimulationWorkspaceLayout } from "@/components/replay/replay-work-space/ReplayWorkSpace"
import { SimulationProgressBar } from "@/components/replay/replay-playback-controller/ReplayPlaybackController"

import { VideoPlayerProps } from './types'

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  sessionData 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  if (isExpanded) {
    // Modal expanded view
    return (
      <>
        {/* Normal compact view still visible underneath */}
        <div className="lg:col-span-2">
          <div className="relative rounded-lg overflow-hidden [aspect-ratio:3/1.63] opacity-50 border border-gray-500" style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 25%, #06b6d4 100%)',
            boxShadow: '0 0 25px rgba(124, 58, 237, 0.15), 0 0 50px rgba(139, 92, 246, 0.08), 0 0 75px rgba(6, 182, 212, 0.03)'
          }}>
            <div className="absolute inset-0 bg-gray-900 rounded-lg overflow-hidden">
              <div className="relative h-full bg-gray-900 overflow-hidden">
                <div className="relative transform scale-50 origin-top-left" style={{ width: '200%', height: '200%' }}>
                  <div style={{ height: '100%' }}>
                    <SimulationWorkspaceLayout />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="relative rounded-xl overflow-hidden shadow-2xl max-w-6xl w-full border border-gray-500" style={{ 
            aspectRatio: '16/10.3',
            background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 25%, #06b6d4 100%)',
            boxShadow: '0 0 35px rgba(124, 58, 237, 0.2), 0 0 70px rgba(139, 92, 246, 0.1), 0 0 105px rgba(6, 182, 212, 0.05)'
          }}>
            <div className="absolute inset-0 bg-gray-900 rounded-lg overflow-hidden">
              {/* Simulation content area - bigger scale for modal */}
              <div className="relative h-full bg-gray-900 overflow-hidden">
                {/* Main workspace - scaled to 75% for better visibility */}
                <div className="relative transform scale-75 origin-top-left" style={{ width: '133%', height: '133%' }}>
                  <div style={{ height: '100%' }}>
                    <SimulationWorkspaceLayout />
                  </div>
                </div>
                
                {/* Progress bar - always visible in modal */}
                <div className="absolute bottom-0 left-0 right-0 z-50">
                  <SimulationProgressBar 
                    isExpanded={true} 
                    onToggleExpand={toggleExpanded} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Normal compact view
  return (
    <div className="lg:col-span-2">
      <div className="relative rounded-lg overflow-hidden [aspect-ratio:3/1.63] border border-gray-500" style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 25%, #06b6d4 100%)',
        boxShadow: '0 0 25px rgba(124, 58, 237, 0.15), 0 0 50px rgba(139, 92, 246, 0.08), 0 0 75px rgba(6, 182, 212, 0.03)'
      }}>
        <div 
          className="absolute inset-0 bg-gray-900 rounded-lg overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Simulation content area - scaled down to fit video dimensions */}
          <div className="relative h-full bg-gray-900 overflow-hidden">
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
              <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
                <SimulationProgressBar 
                  isExpanded={false} 
                  onToggleExpand={toggleExpanded} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}