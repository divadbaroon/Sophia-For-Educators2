export const formatTimestamp = (timestamp: string, sessionStart: string) => {
  console.log('🕐 Timestamp calculation:', { timestamp, sessionStart })
  
  const normalizedSessionStart = sessionStart.includes('+') || sessionStart.includes('Z') 
    ? sessionStart 
    : sessionStart + '+00:00'
  
  const sessionStartTime = new Date(normalizedSessionStart).getTime()
  const eventTime = new Date(timestamp).getTime()
  const diffMs = eventTime - sessionStartTime
  
  if (diffMs < 0) {
    console.log('⚠️ Negative timestamp detected, returning 00:00')
    return "00:00"
  }
  
  const minutes = Math.floor(diffMs / 60000)
  const seconds = Math.floor((diffMs % 60000) / 1000)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const formatDuration = (durationMs: number) => {
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export const formatConceptTitle = (slug: string) => {
  return slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}