export interface EmotionSegment {
 segment_index: number
 begin_time: number
 end_time: number
 text: string
 prosody_emotions: Array<{ name: string; score: number }>
 language_emotions: Array<{ name: string; score: number }>
 burst_emotions: Array<{ name: string; score: number }>
 elevenlabs_conversation_id: string
}

export interface SophiaConversation {
 conversation_id: string
 start_time: string
 end_time?: string | null
}

export interface EmotionTabProps {
 emotionAnalysis: EmotionSegment[]
 sophiaConversations: SophiaConversation[]
 sessionStartTime: string
}