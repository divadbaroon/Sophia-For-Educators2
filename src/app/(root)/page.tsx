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

  return (
    <main className="wrapper page">
      <Header title="All Learning Sessions" subHeader="Public Library"/>

      <section className="video-grid">
        {dummyCards.map((card) => (
            <VideoCard key={card.id} {...card} /> 
        ))}
      </section>

    </main>
  )
}

export default Page