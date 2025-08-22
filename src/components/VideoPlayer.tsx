import React from 'react'
import { Play } from "lucide-react"
import { formatDuration } from '@/lib/utils/formatters'

interface VideoPlayerProps {
  duration_ms: number | null
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ duration_ms }) => {
  return (
    <div className="lg:col-span-2">
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-teal-600 rounded-lg overflow-hidden aspect-video">
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
                  {duration_ms ? formatDuration(duration_ms) : '0:00'}
                </span>
              </div>
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
  )
}