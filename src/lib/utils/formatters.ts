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
  
  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}

export const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.floor(durationMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

export const formatConceptTitle = (slug: string) => {
  return slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}