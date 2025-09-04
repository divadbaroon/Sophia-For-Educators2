import { PromptData } from "@/components/promptSidePanel/types"

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

export type AgentResponse = {
  role: "user" | "agent" | "tool";
  message?: string | null;
  original_message?: string | null;
  time_in_call_secs?: number | null;
  source_medium?: string | null;
  tool_calls?: any[] | null;
  tool_results?: any[] | null;
  feedback?: { score?: string; time_in_call_secs?: number } | null;
  llm_override?: string | null;
  conversation_turn_metrics?: any | null;
  rag_retrieval_info?: {
    chunks?: Array<{ document_id?: string; chunk_id?: string; vector_distance?: number }>;
    embedding_model?: string;
    retrieval_query?: string;
    rag_latency_secs?: number;
  } | null;
  interrupted?: boolean;
  llm_usage?: any | null;
};

export interface FeedbackItem {
  id: string
  severity: "error" | "warning" | "success" | "info"
  title: string
  description: string
  evidence: string
  recommendation: string
  lineNumbers?: number[]
  problemOverview?: string
  exampleVideos?: Array<{
    id: string
    title: string
    description: string
    thumbnailUrl: string
    videoUrl: string
  }>
  suggestedChange?: {
    before: string
    after: string
    explanation: string
  }
  // Add these new fields for real test data
  conversation?: AgentResponse[];
  testMetadata?: {
    testId: string
    status: string
    runId: string
    lastUpdated: number
  }
}

export interface FeedbackData {
  summary: {
    total: number
    errors: number
    warnings: number
    passed: number
  }
  items: FeedbackItem[]
}

export interface FeedbackPanelProps {
  feedbackData: FeedbackData
  selectedLine: number | null
  condition?: string
  onClearSelection?: () => void
  isRunningTests?: boolean
  currentStep?: number
  steps?: string[]
}

export interface FeedbackPanelPropsCondition1 {
  feedbackData: FeedbackData
  selectedLine: number | null
  condition?: string
  onClearSelection?: () => void
  isRunningTests?: boolean
  currentStep?: number
  steps?: string[]
  promptData: PromptData
}