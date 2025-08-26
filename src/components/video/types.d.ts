export interface VideoCardProps {
    // Original video props (now optional)
    id?: string
    title?: string
    thumbnail?: string
    userImg?: string
    username?: string
    createdAt?: Date
    views?: number
    visibility?: string
    duration?: number
    
    // New learning session props
    profileId?: string
    sessionId?: string
    lessonId?: string  
    status?: string
    started_at?: string
    completed_at?: string
    lesson?: string
    messageCount?: number
}

export interface VideoPlayerProps {
  sessionData?: SessionReplayData | null  
}
