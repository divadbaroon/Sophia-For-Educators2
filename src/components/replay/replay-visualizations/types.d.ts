
export interface SimulationBinaryTreeVisualizationOverlayProps {
  onInteraction: () => void; // Dummy function for replay
  terminalHeight?: number;
  sessionId: string | null;    
  lessonId: string | null; 
  strokesData?: Array<{
    zone: string;
    complete_points: Array<{x: number, y: number}>;
  }>; // Optional stroke data for replay
}

export interface SimulationDFSVisualizationOverlayProps {
  onInteraction: () => void; 
  terminalHeight?: number;
  sessionId: string | null;    
  lessonId: string | null; 
  strokesData?: Array<{
    zone: string;
    complete_points: Array<{x: number, y: number}>;
  }>; 
}

export interface SimulationHashTableVisualizationOverlayProps {
  onInteraction: () => void; 
  terminalHeight?: number;
  sessionId: string | null;    
  lessonId: string | null; 
  strokesData?: Array<{
    zone: string;
    complete_points: Array<{x: number, y: number}>;
  }>; 
}