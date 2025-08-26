export interface CodeEvent {
  timestamp: string
  type: string
  description: string
  details?: string
}

export interface CodeProgressTabProps {
  codeSnapshots: any[]
  testResults: any[]
  codeErrors: any[]
  taskProgress: any[]
  sessionStartTime: string
}