'use client'

import React, { useState, useEffect } from 'react'
import Header from "@/components/Header"
import VideoCard from '@/components/VideoCard'
import { getAllLearningSessions } from '@/lib/actions/getAllLearningSessions'

import { dummyCards } from "@/constants"

interface FilterState {
  sortBy: string
  messageFilter: string
  durationFilter: string
  lessonSort: string
}

const Page = () => {
  const [sessionsData, setSessionsData] = useState<any[]>([])
  const [filteredSessions, setFilteredSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'Date',
    messageFilter: 'Messages',
    durationFilter: 'Duration',
    lessonSort: 'Lesson'
  })

  // Fetch data on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      const allLearningSessions = await getAllLearningSessions()
      
      if (allLearningSessions.success && allLearningSessions.data) {
        console.log('Learning Session Data:', allLearningSessions.data)
        setSessionsData(allLearningSessions.data)
        setFilteredSessions(allLearningSessions.data)
      } else {
        console.error('Failed to fetch user demographics:', allLearningSessions.error)
        setSessionsData([])
        setFilteredSessions([])
      }
      setLoading(false)
    }

    fetchSessions()
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...sessionsData]

    // Apply message filter
    if (filters.messageFilter === 'Has messages') {
      filtered = filtered.filter(session => (session.messageCount || 0) > 0)
    } else if (filters.messageFilter === 'No messages') {
      filtered = filtered.filter(session => (session.messageCount || 0) === 0)
    }

    // Apply duration filter
    if (filters.durationFilter === 'Longest duration') {
      filtered = filtered.filter(session => session.started_at && session.completed_at)
        .sort((a, b) => {
          const durationA = new Date(a.completed_at).getTime() - new Date(a.started_at).getTime()
          const durationB = new Date(b.completed_at).getTime() - new Date(b.started_at).getTime()
          return durationB - durationA
        })
    } else if (filters.durationFilter === 'Shortest duration') {
      filtered = filtered.filter(session => session.started_at && session.completed_at)
        .sort((a, b) => {
          const durationA = new Date(a.completed_at).getTime() - new Date(a.started_at).getTime()
          const durationB = new Date(b.completed_at).getTime() - new Date(b.started_at).getTime()
          return durationA - durationB
        })
    }

    // Apply lesson sorting
    if (filters.lessonSort === 'A-Z') {
      filtered.sort((a, b) => (a.lesson || '').localeCompare(b.lesson || ''))
    } else if (filters.lessonSort === 'Z-A') {
      filtered.sort((a, b) => (b.lesson || '').localeCompare(a.lesson || ''))
    }

    // Apply date sorting (this should be last to override other sorts if needed)
    if (filters.sortBy === 'Most recent') {
      filtered.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    } else if (filters.sortBy === 'Oldest') {
      filtered.sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
    } else if (filters.sortBy === 'Most recently completed') {
      filtered = filtered.filter(session => session.completed_at)
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    }

    setFilteredSessions(filtered)
  }, [sessionsData, filters])

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  // Combine session data with cycling thumbnails and user images
  const cardsToDisplay = filteredSessions.map((session, index) => {
    const dummyCard = dummyCards[index % dummyCards.length]
    
    return {
      ...session,
      thumbnail: dummyCard.thumbnail,
      userImg: dummyCard.userImg,
    }
  })

  if (loading) {
    return (
      <main className="wrapper page">
        <Header title="All Learning Sessions" subHeader="Public Library" onFiltersChange={handleFiltersChange} />
        <div className="text-center py-8">Loading sessions...</div>
      </main>
    )
  }

  return (
    <main className="wrapper page">
      <Header title="All Learning Sessions" subHeader="Public Library" onFiltersChange={handleFiltersChange} />

      <section className="video-grid">
        {cardsToDisplay.length > 0 ? (
          cardsToDisplay.map((card, index) => (
            <VideoCard key={card.sessionId || index} {...card} /> 
          ))
        ) : (
          <div className="text-center py-8">No sessions found with current filters.</div>
        )}
      </section>
    </main>
  )
}

export default Page