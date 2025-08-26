export interface TranscriptTabProps {
  messages: Array<{
    id: string
    created_at: string
    role: string
    content: string
  }>
  sessionStartTime: string
}