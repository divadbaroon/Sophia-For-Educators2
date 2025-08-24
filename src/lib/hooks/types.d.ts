export interface UseSessionUrlReturn {
  sessionId: string;
  lessonId: string;
}

export interface UseSessionDataReturn {
  sessionData: TaskData | null;
  isLoadingTasks: boolean;
}

export interface TaskData { 
  title?: string
  tasks: TaskProps[]
  methodTemplates: Record<string, string>
  testCases: Record<string, TestCase[]>
  conceptMappings: Record<number, string[]>
  conceptMap?: ConceptMap 
  system: string
}
