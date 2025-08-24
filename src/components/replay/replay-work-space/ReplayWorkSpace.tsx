'use client'

import React, { useState, useEffect } from "react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { HelpCircle, Pencil, Trash2, X, Menu } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

import { SimulationTaskSidebar } from "@/components/replay/replay-taskbar/ReplayTaskbar"
import { SimulationCodeEditor } from "@/components/replay/replay-code-editor/ReplayCodeEditor"
import { SimulationTerminal }  from "@/components/replay/replay-terminal/ReplayTerminal"
import SimulationSophiaPanel from "@/components/replay/replay-conversationalAI/ReplayConversationalAI"

import { useSimulation } from "@/lib/provider/replay-provider/ReplayProvider"

export const SimulationWorkspaceLayout: React.FC = () => {
  const {
    lessonStructure,
    sophiaStateAtCurrentTime,
    activeTaskAtCurrentTime,
    strokesUpToCurrentTime,
    isLoading,
    error
  } = useSimulation()

  // Local state for UI controls
  const [terminalHeight, setTerminalHeight] = useState(50)
  const [isQuestionPanelVisible, setIsQuestionPanelVisible] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Get current task info
  const currentTask = lessonStructure?.tasks?.[activeTaskAtCurrentTime || 0]
  const activeMethodId = currentTask?.method_name

  // Check if current task is a visualization task
  const isVisualizationTask = activeMethodId === 'dfs_visualization' || 
                             activeMethodId === 'hash_visualization' || 
                             activeMethodId === 'tree_visualization'

  // Update terminal height when switching between task types
  useEffect(() => {
    setTerminalHeight(isVisualizationTask ? 20 : 50)
  }, [isVisualizationTask])

  // Auto-show Sophia panel when it becomes open in timeline
  useEffect(() => {
    setIsQuestionPanelVisible(sophiaStateAtCurrentTime.isOpen)
  }, [sophiaStateAtCurrentTime.isOpen])

  // Calculate button positioning
  const sophiaButtonText = isQuestionPanelVisible ? 'Close Sophia' : 'Ask Sophia'
  const sophiaButtonWidth = isQuestionPanelVisible ? 140 : 130
  const drawingButtonsRightPosition = sophiaButtonWidth + 61

  // Sophia panel controls
  const onToggleSophia = () => {
    if (isQuestionPanelVisible) {
      setIsQuestionPanelVisible(false)
    } else {
      setIsQuestionPanelVisible(true)
    }
  }

  const onCloseSophia = () => {
    setIsQuestionPanelVisible(false)
  }

  // Handle drawing mode - show status only
  const isDrawingMode = strokesUpToCurrentTime.length > 0

  // Loading state
  if (isLoading) {
    return (
      <main className="flex flex-col h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground">Setting up your workspace...</p>
          </div>
        </div>
      </main>
    )
  }

  // Error state
  if (error) {
    return (
      <main className="flex flex-col h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-lg text-red-600">Simulation Error</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
      {/* Clean Navbar with Ask Sophia button */}
      <nav className="w-full bg-white border-b">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            <Link href="/home" className="text-2xl font-bold text-black">
              Sophia<span className="text-blue-600">.</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Drawing Controls - show in navbar for visualization tasks */}
              {isVisualizationTask && (
                <div className="flex gap-2">
                  {/* Draw Button*/}
                  <Button
                    variant={isDrawingMode ? "default" : "outline"}
                    size="sm"
                    className="gap-2 font-medium opacity-75 cursor-not-allowed"
                    disabled={true}
                    title="Drawing mode (simulation replay)"
                  >
                    <Pencil className="h-4 w-4" />
                    Draw
                  </Button>
                  {/* Clear All Button*/}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 font-medium text-red-600 hover:text-red-700 hover:bg-red-50 opacity-75 cursor-not-allowed"
                    disabled={true}
                    title="Clear all drawings (disabled in simulation)"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              )}

              {/* Ask Sophia button in navbar */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                style={{
                  backgroundColor: isQuestionPanelVisible ? 'hsl(var(--secondary))' : 'hsl(var(--background))',
                  opacity: sophiaStateAtCurrentTime.isOpen ? 1 : 0.5
                }}
                onClick={onToggleSophia}
                disabled={!sophiaStateAtCurrentTime.isOpen}
              >
                <HelpCircle className="h-4 w-4" />
                {sophiaButtonText}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/assets/Icons/accountIcon.png" alt="Account" />
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium leading-none">user@example.com</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button className="w-full text-left">
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex flex-col h-screen">
        <div className="flex-1 flex relative">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={28} minSize={20} maxSize={40}>
              <SimulationTaskSidebar />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={70}>
              <div className="relative h-full">
                {/* Code editor area*/}
                <div className="absolute inset-0">
                  <div className="h-full flex flex-col">
                    {/* Code editor */}
                    <div className="flex-1 relative">
                      <SimulationCodeEditor terminalHeight={terminalHeight} />
                      
                      {/* Sophia panel*/}
                      {isQuestionPanelVisible && (
                        <div className="absolute top-4 right-6 w-80 z-30 bg-background border rounded-xl shadow-xl max-h-80 overflow-hidden">
                          <SimulationSophiaPanel/>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drag handle for resizing terminal*/}
                <div
                  className="absolute left-0 right-0 h-2 bg-gray-100 hover:bg-gray-200 cursor-ns-resize z-20"
                  style={{
                    bottom: `${terminalHeight}%`,
                    marginBottom: "-4px",
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    const startY = e.clientY
                    const startHeight = terminalHeight
                    const containerHeight = e.currentTarget.parentElement?.clientHeight || 0

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const deltaY = startY - moveEvent.clientY
                      const deltaPercent = (deltaY / containerHeight) * 100
                      const newHeight = startHeight + deltaPercent
                      setTerminalHeight(Math.min(Math.max(newHeight, 5), 70))
                    }

                    const handleMouseUp = () => {
                      document.removeEventListener("mousemove", handleMouseMove)
                      document.removeEventListener("mouseup", handleMouseUp)
                    }

                    document.addEventListener("mousemove", handleMouseMove)
                    document.addEventListener("mouseup", handleMouseUp)
                  }}
                />

                {/* Terminal*/}
                <div
                  className="absolute left-0 right-0 bottom-0 bg-background"
                  style={{ height: `${terminalHeight}%` }}
                >
                  <SimulationTerminal />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </>
  )
}