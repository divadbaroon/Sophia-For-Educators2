import React from 'react'

import { TabsContent } from "@/components/ui/tabs"

import { useSimulation } from '@/lib/provider/replay-provider/ReplayProvider'

import { formatTimestamp } from '@/lib/utils/formatters'
import { getTimeFromStart } from '@/lib/utils/replay-provider/time-utils'

import { emotionColors } from '@/constants'

import { EmotionSegment, SophiaConversation, EmotionTabProps } from './types'

const getEmotionColor = (name: string): string => {
 // Clean the emotion name to match keys
 const cleaned = name
   .toLowerCase()
   .replace(/[()]/g, " ")
   .replace(/[^a-z0-9\s]/g, " ")
   .replace(/\s+/g, " ")
   .trim()
 
 if (!cleaned) return "#879aa1"
 
 const parts = cleaned.split(" ")
 const camelCase = parts[0] + parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")
 
 if (emotionColors[camelCase]) return emotionColors[camelCase]
 
 // Generate fallback color based on name
 let hash = 0
 for (let i = 0; i < name.length; i++) {
   hash = (hash * 31 + name.charCodeAt(i)) % 360
 }
 return `hsl(${hash}, 70%, 60%)`
}

// Helper to convert conversation-relative time to session-relative timestamp
const getSessionRelativeTimestamp = (
 emotionTime: number, 
 conversationId: string, 
 conversations: SophiaConversation[],
 sessionStart: string
): string => {
 const conversation = conversations.find(c => c.conversation_id === conversationId)
 if (!conversation) {
   // Fallback: treat emotion time as seconds from session start
   return new Date(new Date(sessionStart).getTime() + (emotionTime * 1000)).toISOString()
 }
 
 const conversationStartMs = new Date(conversation.start_time).getTime()
 const emotionTimestampMs = conversationStartMs + (emotionTime * 1000)
 
 return new Date(emotionTimestampMs).toISOString()
}

const EmotionBar = ({ emotion, maxScore }: { emotion: { name: string; score: number }, maxScore: number }) => {
 const percentage = Math.max(10, (emotion.score / maxScore) * 100)
 const color = getEmotionColor(emotion.name)
 
 return (
   <div className="flex items-center gap-2 text-xs">
     <div className="w-16 text-right truncate" title={emotion.name}>
       {emotion.name}
     </div>
     <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
       <div 
         className="h-2 rounded-full"
         style={{ 
           width: `${percentage}%`, 
           backgroundColor: color 
         }}
       />
     </div>
     <div className="w-8 text-xs text-gray-500">
       {emotion.score.toFixed(2)}
     </div>
   </div>
 )
}

export const EmotionTab: React.FC<EmotionTabProps> = ({ 
 emotionAnalysis,
 sophiaConversations,
 sessionStartTime 
}) => {
 const { setCurrentTime } = useSimulation()

 const handleTimestampClick = (formattedTime: string, timestamp: string, conversationId: string) => {
   // Calculate the time offset from session start
   const timeOffset = getTimeFromStart(timestamp, sessionStartTime)
   
   // Jump to that time in the progress bar
   setCurrentTime(timeOffset)
   
   console.log('Emotion timestamp clicked:', {
     formatted: formattedTime,
     raw: timestamp,
     conversationId,
     sessionStart: sessionStartTime,
     calculatedOffset: timeOffset,
     jumpingTo: `${timeOffset}ms`
   })
 }

 // Group segments by conversation
 const segmentsByConversation = emotionAnalysis.reduce((acc, segment) => {
   if (!acc[segment.elevenlabs_conversation_id]) {
     acc[segment.elevenlabs_conversation_id] = []
   }
   acc[segment.elevenlabs_conversation_id].push(segment)
   return acc
 }, {} as Record<string, EmotionSegment[]>)

 const getTopEmotions = (emotions: Array<{ name: string; score: number }>, count = 3) => {
   return emotions
     .filter(e => e.score > 0)
     .sort((a, b) => b.score - a.score)
     .slice(0, count)
 }

 if (!emotionAnalysis || emotionAnalysis.length === 0) {
   return (
     <TabsContent value="emotion" className="mt-4">
       <p className="text-gray-500 text-sm">No emotion analysis available for this session.</p>
     </TabsContent>
   )
 }

 return (
   <TabsContent value="emotion" className="mt-4 space-y-4 max-h-96 overflow-y-auto">
     <div className="space-y-6 text-sm">
       {Object.entries(segmentsByConversation).map(([conversationId, segments]) => {
         
         return (
           <div key={conversationId} className="border-l-2 border-blue-200 pl-4">     
             <div className="space-y-4">
               {segments.map((segment, index) => {
                 const emotionTimestamp = getSessionRelativeTimestamp(
                   segment.begin_time, 
                   conversationId, 
                   sophiaConversations,
                   sessionStartTime
                 )
                 
                 const formattedTime = formatTimestamp(emotionTimestamp, sessionStartTime)
                 
                 const languageEmotions = getTopEmotions(segment.language_emotions, 3)
                 const prosodyEmotions = getTopEmotions(segment.prosody_emotions, 3)
                 
                 const maxScore = Math.max(
                   ...languageEmotions.map(e => e.score),
                   ...prosodyEmotions.map(e => e.score),
                   0.1
                 )

                 return (
                   <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                     <div className="flex items-start gap-3">
                       <span 
                         className="text-pink-500 font-medium cursor-pointer hover:text-pink-700 hover:underline text-xs mt-1"
                         onClick={() => handleTimestampClick(formattedTime, emotionTimestamp, conversationId)}
                         title="Click to jump to this time in the video"
                       >
                         [{formattedTime}]
                       </span>
                       
                       <div className="flex-1 min-w-0">
                         <p className="text-gray-800 mb-2 leading-relaxed">
                           {segment.text}
                         </p>
                         
                         <div className="grid grid-cols-1 gap-3">
                           {languageEmotions.length > 0 && (
                             <div>
                               <h4 className="text-xs font-medium text-gray-600 mb-1">Language</h4>
                               <div className="space-y-1">
                                 {languageEmotions.map((emotion, i) => (
                                   <EmotionBar key={i} emotion={emotion} maxScore={maxScore} />
                                 ))}
                               </div>
                             </div>
                           )}
                           
                           {prosodyEmotions.length > 0 && (
                             <div>
                               <h4 className="text-xs font-medium text-gray-600 mb-1">Voice</h4>
                               <div className="space-y-1">
                                 {prosodyEmotions.map((emotion, i) => (
                                   <EmotionBar key={i} emotion={emotion} maxScore={maxScore} />
                                 ))}
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                 )
               })}
             </div>
           </div>
         )
       })}
     </div>
   </TabsContent>
 )
}