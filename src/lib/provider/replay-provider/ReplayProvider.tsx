'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

import { useSessionData } from '@/lib/hooks/useSessionData';

import { useSimulationUrl } from '@/lib/hooks/useSimulationUrl';
import { getTimeFromStart } from '@/lib/utils/replay-provider/time-utils';

import { SessionReplayData, SimulationContextType } from "@/types"

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider = ({ 
  children, 
  initialSessionData 
}: { 
  children: ReactNode
  initialSessionData?: SessionReplayData | null 
}) => {
  // URL extraction
  const { sessionId, lessonId } = useSimulationUrl();
  
  // Load lesson structure data (tasks, examples, templates)
  const { sessionData: lessonStructure, isLoadingTasks } = useSessionData(lessonId);
  
  // Session replay data state - use initial data if provided
  const [sessionData, setSessionData] = useState<SessionReplayData | null>(initialSessionData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio cache state
  const [audioCache, setAudioCache] = useState<Record<string, Blob>>({});
  const [audioPreloadStatus, setAudioPreloadStatus] = useState({
    isPreloading: false,
    progress: 0,
    totalConversations: 0
  });
  
  // Timeline control state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Calculate session duration
  const sessionDuration = useMemo(() => {
    return sessionData?.sessionInfo.duration_ms || 0;
  }, [sessionData]);

  // Preload and store audio data
  const preloadAudioInBackground = async (conversations: any[]) => {
    if (conversations.length === 0) return;

    console.log(`🎵 Preloading and caching ${conversations.length} audio files...`);
    setAudioPreloadStatus({
      isPreloading: true,
      progress: 0,
      totalConversations: conversations.length
    });

    const newCache: Record<string, Blob> = {};
    let loaded = 0;
    
    // Use Promise.allSettled to preload all audio in parallel
    const preloadPromises = conversations.map(async (conversation) => {
      try {
        const response = await fetch(`/api/elevenlabs/conversation-audio/${conversation.conversation_id}`);
        if (response.ok) {
          const audioBlob = await response.blob();
          newCache[conversation.conversation_id] = audioBlob;
          console.log(`✅ Cached: ${conversation.conversation_id}`);
        } else {
          console.log(`⚠️ Failed to preload: ${conversation.conversation_id}`);
        }
      } catch (error) {
        console.log(`⚠️ Error preloading: ${conversation.conversation_id}`, error);
      }
      
      loaded++;
      const progress = (loaded / conversations.length) * 100;
      setAudioPreloadStatus(prev => ({ ...prev, progress }));
    });

    await Promise.allSettled(preloadPromises);
    
    setAudioCache(newCache);
    setAudioPreloadStatus(prev => ({ ...prev, isPreloading: false }));
    console.log(`🎵 ✅ Audio cache loaded: ${Object.keys(newCache).length} conversations ready!`);
  };

  // Get cached audio blob
  const getCachedAudioBlob = useCallback((conversationId: string): Blob | null => {
    return audioCache[conversationId] || null;
  }, [audioCache]);

  // Load session data when sessionId changes (only if not provided initially)
  useEffect(() => {
    if (!sessionId) return;
    
    // If we already have initial session data, just start audio preloading
    if (initialSessionData) {
      console.log('🎬 Using provided session data, starting audio preload...');
      setSessionData(initialSessionData);
      
      if (initialSessionData.sophiaConversations.length > 0) {
        preloadAudioInBackground(initialSessionData.sophiaConversations);
      }
      return;
    }
  }, [sessionId, initialSessionData]);

  // Filter data based on current time
  const codeAtCurrentTime = useMemo(() => {
    if (!sessionData) return null;
    
    const sessionStart = sessionData.sessionInfo.started_at;
    console.log("START TIME", sessionStart)
    
    const relevantSnapshots = sessionData.codeSnapshots.filter(snapshot => {
      const snapshotTime = getTimeFromStart(snapshot.created_at, sessionStart);
      return snapshotTime <= currentTime;
    });
    
    // Return the most recent code content
    const latestSnapshot = relevantSnapshots[relevantSnapshots.length - 1];
    return latestSnapshot?.code_content || null;
  }, [sessionData, currentTime]);

  const activeTaskAtCurrentTime = useMemo(() => {
    if (!sessionData) return null;
    
    const sessionStart = sessionData.sessionInfo.started_at;
    const relevantNavigation = sessionData.navigationEvents.filter(nav => {
      const navTime = getTimeFromStart(nav.timestamp, sessionStart);
      return navTime <= currentTime;
    });
    
    // Return the most recent task index
    const latestNav = relevantNavigation[relevantNavigation.length - 1];
    return latestNav?.to_task_index ?? 0; // Default to task 0
  }, [sessionData, currentTime]);

  const strokesUpToCurrentTime = useMemo(() => {
    if (!sessionData) return [];
    
    const sessionStart = sessionData.sessionInfo.started_at;
    return sessionData.strokeData.filter(stroke => {
      const strokeTime = getTimeFromStart(stroke.created_at, sessionStart);
      return strokeTime <= currentTime;
    });
  }, [sessionData, currentTime]);

  const messagesUpToCurrentTime = useMemo(() => {
    if (!sessionData) return [];
    
    const sessionStart = sessionData.sessionInfo.started_at;
    console.log('🕐 Session start time:', sessionStart);
    console.log('🕐 Current time:', currentTime);
    
    return sessionData.messages.filter(message => {
      const messageTime = getTimeFromStart(message.created_at, sessionStart);
      console.log(`📧 Message at ${message.created_at} → offset: ${messageTime}ms → show: ${messageTime <= currentTime}`);
      return messageTime <= currentTime;
    });
  }, [sessionData, currentTime]);

  const sophiaStateAtCurrentTime = useMemo(() => {
    if (!sessionData) return { isOpen: false, conversations: [], highlights: [] };
    
    const sessionStart = sessionData.sessionInfo.started_at;
    
    // Check if Sophia panel is open at current time
    const relevantButtonInteractions = sessionData.sophiaButtonInteractions.filter(interaction => {
      const interactionTime = getTimeFromStart(interaction.timestamp, sessionStart);
      return interactionTime <= currentTime;
    });
    
    // Determine if panel is open (last interaction type)
    const lastInteraction = relevantButtonInteractions[relevantButtonInteractions.length - 1];
    const isOpen = lastInteraction?.interaction_type === 'open';
    
    // Get conversations up to current time
    const conversations = sessionData.sophiaConversations.filter(conv => {
      const convTime = getTimeFromStart(conv.start_time, sessionStart);
      return convTime <= currentTime;
    });
    
    // Get highlights up to current time
    const highlights = sessionData.sophiaHighlights.filter(highlight => {
      const highlightTime = getTimeFromStart(highlight.highlighted_at, sessionStart);
      return highlightTime <= currentTime;
    });
    
    return { isOpen, conversations, highlights };
  }, [sessionData, currentTime]);

  const testResultsUpToCurrentTime = useMemo(() => {
    if (!sessionData) return [];
    
    const sessionStart = sessionData.sessionInfo.started_at;
    return sessionData.testResults.filter(test => {
      const testTime = getTimeFromStart(test.created_at, sessionStart);
      return testTime <= currentTime;
    });
  }, [sessionData, currentTime]);

  const navigationEventsUpToCurrentTime = useMemo(() => {
    if (!sessionData) return [];
    
    const sessionStart = sessionData.sessionInfo.started_at;
    return sessionData.navigationEvents.filter(nav => {
      const navTime = getTimeFromStart(nav.timestamp, sessionStart);
      return navTime <= currentTime;
    });
  }, [sessionData, currentTime]);

  const userHighlightsUpToCurrentTime = useMemo(() => {
    if (!sessionData) return [];
    
    const sessionStart = sessionData.sessionInfo.started_at;
    return sessionData.userHighlights.filter(highlight => {
      const highlightTime = getTimeFromStart(highlight.highlighted_at, sessionStart);
      return highlightTime <= currentTime;
    });
  }, [sessionData, currentTime]);

  const codeErrorsUpToCurrentTime = useMemo(() => {
    if (!sessionData) return [];
    
    const sessionStart = sessionData.sessionInfo.started_at;
    return sessionData.codeErrors.filter(error => {
      const errorTime = getTimeFromStart(error.created_at, sessionStart);
      return errorTime <= currentTime;
    });
  }, [sessionData, currentTime]);

  const taskProgressUpToCurrentTime = useMemo(() => {
    if (!sessionData) return [];
    
    const sessionStart = sessionData.sessionInfo.started_at;
    return sessionData.taskProgress.filter(progress => {
      const progressTime = getTimeFromStart(progress.created_at, sessionStart);
      return progressTime <= currentTime;
    });
  }, [sessionData, currentTime]);

  const value: SimulationContextType = {
    // Session data
    sessionId,
    lessonId,
    sessionData,
    lessonStructure,        
    isLoading,
    isLoadingTasks,         
    error,
    
    // Timeline control
    currentTime,
    sessionDuration,
    isPlaying,
    playbackSpeed,
    
    // Timeline actions
    setCurrentTime,
    setIsPlaying,
    setPlaybackSpeed,
    
    // Audio functions (cached blobs)
    getCachedAudioBlob,
    audioPreloadProgress: audioPreloadStatus.progress,
    isAudioPreloading: audioPreloadStatus.isPreloading,
    
    // Filtered data at current time
    codeAtCurrentTime,
    activeTaskAtCurrentTime,
    strokesUpToCurrentTime,
    messagesUpToCurrentTime,
    sophiaStateAtCurrentTime,
    testResultsUpToCurrentTime,
    navigationEventsUpToCurrentTime,
    userHighlightsUpToCurrentTime,
    codeErrorsUpToCurrentTime,
    taskProgressUpToCurrentTime,
  };
  
  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};