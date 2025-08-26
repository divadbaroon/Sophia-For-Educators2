export interface SessionHeaderProps {
  conceptId: string
  sessionInfo: {
    status: string
    duration_ms: number | null
  }
}

export interface SharedHeaderProps {
  subHeader: string
  title: string
  userImg?: string
  onFiltersChange?: (filters: any) => void
  availableLessons?: string[]  
}