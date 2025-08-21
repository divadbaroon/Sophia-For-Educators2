"use server"

import { createClient } from "@/lib/utils/supabase/server"

// Get learning sessions for users whose demographics were created after a 2025-08-11
export async function getAllLearningSessions(createdAfter: string = '2025-08-11 04:14:16.823464+00') {
  const supabase = await createClient()
  
  try {
    // First get the user_ids from user_demographics
    const { data: userIds, error: userError } = await supabase
      .from('user_demographics')
      .select('user_id')
      .gte('created_at', createdAfter)

    if (userError) {
      console.error('Error fetching user demographics:', userError)
      return { success: false, error: userError.message }
    }

    if (!userIds || userIds.length === 0) {
      return { success: true, data: [] }
    }

    // Extract just the user_id values for the IN query
    const profileIds = userIds.map(item => item.user_id)

    // Get learning sessions for those users with lesson data, also filtered by created_at
    const { data: sessionsData, error } = await supabase
      .from('learning_sessions')
      .select(`
        id,
        profile_id,
        status,
        started_at,
        completed_at,
        lessons (
          title
        )
      `)
      .in('profile_id', profileIds)
      .gte('created_at', createdAfter)
      .order('started_at', { ascending: true })

    if (error) {
      console.error('Error fetching learning sessions:', error)
      return { success: false, error: error.message }
    }

    // Get message counts for each session
    const sessionIds = sessionsData?.map(session => session.id.toString()) || []
    
    let messageCounts: Record<string, number> = {}
    if (sessionIds.length > 0) {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('session_id')
        .in('session_id', sessionIds)

      if (messageError) {
        console.error('Error fetching message counts:', messageError)
        // Continue without message counts rather than failing
      } else {
        // Count messages per session
        messageCounts = messageData?.reduce((acc, message) => {
          acc[message.session_id] = (acc[message.session_id] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}
      }
    }

    // Transform the data to the desired format
    const transformedData = sessionsData?.map(session => {
      // Handle the lessons data safely
      let lessonTitle = 'Unknown Lesson'
      if (session.lessons) {
        if (Array.isArray(session.lessons)) {
          lessonTitle = session.lessons[0]?.title || 'Unknown Lesson'
        } else {
          lessonTitle = (session.lessons as any).title || 'Unknown Lesson'
        }
      }

      return {
        profileId: session.profile_id,
        sessionId: session.id,
        status: session.status,
        started_at: session.started_at,
        completed_at: session.completed_at,
        lesson: lessonTitle,
        messageCount: messageCounts[session.id.toString()] || 0
      }
    }) || []

    return { success: true, data: transformedData }
  } catch (error) {
    console.error('Error in getUserDemographics:', error)
    return { success: false, error: "Failed to fetch learning sessions" }
  }
}