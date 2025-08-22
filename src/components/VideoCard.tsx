"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircleCode } from 'lucide-react'

import { VideoCardProps } from "@/types"

const VideoCard = ({
    // Original props
    id,
    title,
    thumbnail,
    userImg,
    username,
    createdAt,
    views,
    visibility,
    duration,
    
    // New learning session props
    profileId,
    sessionId,
    lessonId,  
    status,
    started_at,
    completed_at,
    lesson,
    messageCount
}: VideoCardProps) => {
    // Calculate duration from learning session data if available
    const calculateDuration = () => {
        if (duration) return duration // Use original duration if provided
        
        if (started_at && completed_at) {
            const startTime = new Date(started_at).getTime()
            const endTime = new Date(completed_at).getTime()
            const durationMs = endTime - startTime
            return Math.round(durationMs / 1000 / 60) // Convert to minutes
        }
        
        return null
    }

    // Format lesson name for URL (spaces to dashes, lowercase)
    const formatLessonForUrl = (lessonName: string) => {
        return lessonName.toLowerCase().replace(/\s+/g, '-')
    }

    const sessionDuration = calculateDuration()

    return (
        <Link 
            href={`/replay/concept/${lesson ? formatLessonForUrl(lesson) : lessonId}/session/${sessionId || id}`} 
            className="video-card"
        >
            <Image src={thumbnail || '/assets/images/placeholder-thumbnail.jpg'} alt="thumbnail" width={290} height={160}
            className="thumbnail" />
            <article>
                <div>
                    <figure>
                        <Image src={userImg || '/assets/images/dummy.jpg'} alt="avatar" width={34} height={34}
                        className="rounded-full aspect-square" />
                        <figcaption>
                            <h3>{username || 'Student'}</h3>
                            <p>{visibility || (status === 'in_progress' ? 'In Progress' : status)}</p>
                        </figcaption>
                    </figure>
                    <aside>
                        <MessageCircleCode size={16} className="text-gray-600" />
                        <span>{messageCount || views || 0}</span>
                    </aside>
                </div>
                <h2>
                    {title || lesson} - {" "}
                    {completed_at ? 
                        new Date(completed_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }) :
                        (createdAt || (started_at ? new Date(started_at) : new Date())).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })
                    }
                </h2>
            </article>
            {sessionDuration && (
                <div className="duration">
                    {sessionDuration}min
                </div>
            )}
        </Link>
    )
} 

export default VideoCard