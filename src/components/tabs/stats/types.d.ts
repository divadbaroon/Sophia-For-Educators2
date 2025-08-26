export interface StatsTabProps {
  sessionInfo: {
    duration_ms: number | null
    status: string
  }
  messages: any[]
  codeSnapshots: any[]
  testResults: any[]
  taskProgress: any[]
}