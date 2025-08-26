export interface SessionReplayData {
  // Session metadata
  sessionInfo: {
    id: string
    profile_id: string
    class_id: string
    lesson_id: string
    status: string
    started_at: string
    completed_at: string | null
    duration_ms: number | null
  }
  
  // All timestamped events for replay
  codeSnapshots: Array<{
    id: string
    task_index: number
    method_id: string
    code_content: string
    created_at: string
  }>
  
  navigationEvents: Array<{
    id: string
    from_task_index: number
    to_task_index: number
    navigation_direction: string
    timestamp: string
  }>
  
  strokeData: Array<{
    id: string
    task: string
    zone: string
    stroke_number: number
    point_count: number
    complete_points: any[]
    start_point: any
    end_point: any
    created_at: string
  }>
  
  visualizationInteractions: Array<{
    id: string
    task: string
    action: string
    zone: string
    x: number
    y: number
    timestamp: string
  }>
  
  testResults: Array<{
    id: string
    task_index: number
    method_id: string
    test_case_index: number
    test_input: any
    expected_output: any
    actual_output: any
    passed: boolean
    error_message: string | null
    created_at: string
  }>
  
  sophiaButtonInteractions: Array<{
    id: string
    current_task_index: number
    interaction_type: string
    timestamp: string
  }>
  
  sophiaConversations: Array<{
    id: string
    conversation_id: string  // ElevenLabs conversation ID
    session_id: string
    start_time: string
    end_time: string | null
    created_at: string
  }>
  
  sophiaHighlights: Array<{
    id: string
    line_number: number
    highlighted_at: string
  }>
  
  userHighlights: Array<{
    id: string
    highlighted_text: string
    highlighted_at: string
  }>
  
  messages: Array<{
    id: string
    content: string
    role: string
    created_at: string
  }>
  
  codeErrors: Array<{
    id: string
    task_index: number
    error_message: string
    created_at: string
  }>
  
  taskProgress: Array<{
    id: string
    task_index: number
    completed: boolean
    completed_at: string | null
    attempts: number
    test_cases_passed: number
    total_test_cases: number
    created_at: string
  }>

  emotionAnalysis: Array<{
    segment_index: number
    begin_time: number
    end_time: number
    text: string
    prosody_emotions: Array<{ name: string; score: number }>
    language_emotions: Array<{ name: string; score: number }>
    burst_emotions: Array<{ name: string; score: number }>
    elevenlabs_conversation_id: string
  }>
}

export interface VideoDetailsPageProps {
  params: Promise<{
    conceptId: string
    sessionId: string
  }>
}

export interface ActivityEvent {
  timestamp: string
  type: string
  description: string
  details?: string
}

export interface CodeEvent {
  timestamp: string
  type: string
  description: string
  details?: string
}

export interface SimulationContextType {
  // Session data
  sessionId: string | null
  lessonId: string | null
  sessionData: SessionReplayData | null
  lessonStructure: any | null
  isLoading: boolean
  isLoadingTasks: boolean
  error: string | null
  
  // Timeline control
  currentTime: number
  sessionDuration: number
  isPlaying: boolean
  playbackSpeed: number
  
  // Timeline actions
  setCurrentTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setPlaybackSpeed: (speed: number) => void
  
  // Audio functions (cached blobs)
  getCachedAudioBlob: (conversationId: string) => Blob | null
  audioPreloadProgress: number
  isAudioPreloading: boolean
  
  // Filtered data at current time
  codeAtCurrentTime: string | null
  activeTaskAtCurrentTime: number | null
  strokesUpToCurrentTime: any[]
  messagesUpToCurrentTime: any[]
  sophiaStateAtCurrentTime: {
    isOpen: boolean
    conversations: any[]
    highlights: any[]
  }
  testResultsUpToCurrentTime: any[]
  navigationEventsUpToCurrentTime: any[]
  visualizationInteractionsUpToCurrentTime: any[]
  userHighlightsUpToCurrentTime: any[]
  codeErrorsUpToCurrentTime: any[]
  taskProgressUpToCurrentTime: any[]
}