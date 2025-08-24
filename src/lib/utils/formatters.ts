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

export const formatConceptTitle = (conceptId: string) => {
  // Map concept IDs to their proper lesson names
  const conceptIdMap: Record<string, string> = {
    '899e4241-288a-4e7d-875d-f395ab32015d': 'Graph Algorithms',
    'ed1cd4fa-42bc-4f59-8a3c-fc3fae1c9176': 'Binary Search Trees',
    '0cff2209-b34f-45b4-8a79-9503d0066ab8': 'Singly Linked Lists',
    '3317ea88-7f0b-45af-ad1e-57ed56b69d51': 'Hash Tables',
    '15af35b6-69c4-43d0-8403-a273ed587ee0': 'Sorting Algorithms'
  }
  
  // Return mapped name if it exists, otherwise fallback to formatted slug
  if (conceptIdMap[conceptId]) {
    return conceptIdMap[conceptId]
  }
  
  // Fallback: format as title case from slug (original behavior)
  return conceptId.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}