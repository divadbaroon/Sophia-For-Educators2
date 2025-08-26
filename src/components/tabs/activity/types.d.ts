export interface ActivityEvent {
  timestamp: string
  type: string
  description: string
  details?: string
}

export interface ActivityTabProps {
  navigationEvents: any[]
  sophiaButtonInteractions: any[]
  sophiaHighlights: any[]
  userHighlights: any[]
  strokeData: any[]
  sessionStartTime: string
}