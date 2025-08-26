import React from 'react'

import { TabsContent } from "@/components/ui/tabs"

import { formatTimestamp } from '@/lib/utils/formatters'

import { EmotionSegment, SophiaConversation, EmotionTabProps } from './types'

// Emotion colors matching the original analysis tool
const emotionColors: Record<string, string> = {
 joy: "#ffd600",
 interest: "#8fd1c4",
 excitement: "#fff974",
 amusement: "#febf52",
 determination: "#ff5c00",
 concentration: "#336cff",
 calmness: "#a9cce1",
 satisfaction: "#a6ddaf",
 contentment: "#e5c6b4",
 confidence: "#9a4cb6",
 admiration: "#ffc58f",
 adoration: "#ffc6cc",
 aestheticAppreciation: "#e2cbff",
 anger: "#b21816",
 annoyance: "#5f6b7c",
 anxiety: "#6e42cc",
 awe: "#7dabd3",
 awkwardness: "#d7d99d",
 boredom: "#8f99a6",
 contemplation: "#b0aeef",
 confusion: "#c66a26",
 contempt: "#76842d",
 craving: "#54591c",
 disappointment: "#006c7c",
 disapproval: "#4e591a",
 disgust: "#1a7a41",
 distress: "#c5f264",
 doubt: "#998644",
 ecstasy: "#ff48a4",
 embarrassment: "#63c653",
 empathicPain: "#ca5555",
 enthusiasm: "#ff9142",
 entrancement: "#7554d6",
 envy: "#1d4921",
 fear: "#d1c9ef",
 gratitude: "#f0d3b6",
 guilt: "#879aa1",
 horror: "#772e7a",
 love: "#f44f4c",
 neutral: "#879aa1",
 nostalgia: "#b087a1",
 pain: "#8c1d1d",
 pride: "#9a4cb6",
 realization: "#217aa8",
 relief: "#fe927a",
 romance: "#f0cc86",
 sadness: "#305575",
 sarcasm: "#7f53a4",
 sexualDesire: "#aa0d59",
 shame: "#8a6262",
 surprise: "#70e63a",
 surpriseNegative: "#319d3f",
 surprisePositive: "#7affff",
 sympathy: "#7f88e0",
 tiredness: "#757575",
 triumph: "#ec8132"
}

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
 const handleTimestampClick = (formattedTime: string, timestamp: string, conversationId: string) => {
   console.log('Emotion timestamp clicked:', {
     formatted: formattedTime,
     raw: timestamp,
     conversationId,
     sessionStart: sessionStartTime
   })
   // Video seeking logic here
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
                         title="Click to seek to this time"
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