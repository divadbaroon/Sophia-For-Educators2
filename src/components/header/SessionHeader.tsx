import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { formatDuration, formatConceptTitle } from '@/lib/utils/formatters'

import { SessionHeaderProps } from './types'

export const SessionHeader: React.FC<SessionHeaderProps> = ({ conceptId, sessionInfo }) => {
  return (
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
  )
}