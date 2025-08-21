import React from 'react'
import Header from "@/components/Header"
import VideoCard from '@/components/VideoCard'
import { getAllLearningSessions } from '@/lib/actions/getAllLearningSessions'

import { dummyCards } from "@/constants"

const Page = async () => {
  const allLearningSessions = await getAllLearningSessions()
  
  if (allLearningSessions.success) {
    console.log('Learning Session Data:', allLearningSessions.data)
    console.log('Number of learning sessions found:', allLearningSessions.data?.length || 0)
  } else {
    console.error('Failed to fetch user demographics:', allLearningSessions.error)
  }

  // Use learning sessions data if available, otherwise fallback to dummy data
  const sessionsToDisplay = allLearningSessions.success && allLearningSessions.data 
    ? allLearningSessions.data 
    : []

  // Combine session data with cycling thumbnails and user images
  const cardsToDisplay = sessionsToDisplay.map((session, index) => {
    const dummyCard = dummyCards[index % dummyCards.length] // Cycle through dummy cards
    
    return {
      ...session,
      thumbnail: dummyCard.thumbnail,
      userImg: dummyCard.userImg,
    }
  })

  return (
    <main className="wrapper page">
      <Header title="All Learning Sessions" subHeader="Public Library"/>

      <section className="video-grid">
        {cardsToDisplay.length > 0 ? (
          cardsToDisplay.map((card, index) => (
            <VideoCard key={card.sessionId || index} {...card} /> 
          ))
        ) : (
          // Fallback to dummy cards if no sessions
          dummyCards.map((card) => (
            <VideoCard key={card.id} {...card} /> 
          ))
        )}
      </section>

    </main>
  )
}

export default Page