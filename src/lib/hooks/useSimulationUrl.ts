'use client'

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const useSimulationUrl = () => {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string>('');
  const [lessonId, setLessonId] = useState<string>('');

  useEffect(() => {
    // Match pattern: /replay/[lessonId]/session/[sessionId]
    const urlMatch = pathname?.match(/\/replay\/concept\/([^\/]+)\/session\/([^\/]+)/);

    if (urlMatch) {
      const [, newLessonId, newSessionId] = urlMatch;
      
      if (newLessonId !== lessonId || newSessionId !== sessionId) {
        console.log("Simulation URL - Lesson ID:", newLessonId, "Session ID:", newSessionId);
        setLessonId(newLessonId);
        setSessionId(newSessionId);
      }
    }
  }, [pathname, lessonId, sessionId]);

  return { sessionId, lessonId };
};