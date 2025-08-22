import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play } from "lucide-react"

const VideoDetailsPage = () => {
  return (
    <main className="wrapper page">

        {/* Video Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Team Update - Sprint Planning Meeting</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Avatar className="w-5 h-5">
                <AvatarImage src="/placeholder.svg?height=20&width=20" />
                <AvatarFallback>GS</AvatarFallback>
              </Avatar>
              <span>Glen Smith</span>
              <span>•</span>
              <span>3 days ago</span>
            </div>
          </div>
        </div>

        {/* Video Player and Transcript */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-teal-600 rounded-lg overflow-hidden aspect-video">
              {/* Simulated macOS window */}
              <div className="absolute inset-4 bg-gray-900 rounded-lg overflow-hidden">
                {/* macOS title bar */}
                <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-gray-400 text-xs">Finder</span>
                  </div>
                </div>

                {/* Video content area */}
                <div className="relative h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  {/* Play button */}
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                    <Play className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" />
                  </div>

                  {/* Video controls */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center gap-2">
                        <span className="bg-black/50 px-2 py-1 rounded">1x</span>
                      </div>
                      <span className="bg-black/50 px-2 py-1 rounded">4 min</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1 bg-white/30 rounded-full">
                      <div className="h-full w-1/4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* macOS dock simulation */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-8 h-8 bg-white/30 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Panel */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="transcript"
                  className="text-xs data-[state=active]:text-pink-600 data-[state=active]:border-b-2 data-[state=active]:border-pink-600"
                >
                  Transcript
                </TabsTrigger>
                <TabsTrigger value="metadata" className="text-xs">
                  Meta data
                </TabsTrigger>
                <TabsTrigger value="viewers" className="text-xs">
                  Viewers
                </TabsTrigger>
                <TabsTrigger value="chapters" className="text-xs">
                  Chapters
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-pink-500 font-medium">[00:00]</span>
                    <span className="text-gray-600 ml-2">
                      Hey team, quick update from today's sprint planning meeting.
                    </span>
                  </div>

                  <div>
                    <span className="text-pink-500 font-medium">[00:12]</span>
                    <span className="text-gray-600 ml-2">
                      We've finalized the top priorities for this sprint, which mainly include the dashboard redesign,
                      several backend performance improvements, and a better mobile app experience.
                    </span>
                  </div>

                  <div>
                    <span className="text-pink-500 font-medium">[00:30]</span>
                    <span className="text-gray-600 ml-2">
                      There were a few blockers raised during the discussion, particularly related to slow API response
                      times.
                    </span>
                  </div>

                  <div>
                    <span className="text-pink-500 font-medium">[00:38]</span>
                    <span className="text-gray-600 ml-2">
                      The development team will be focusing first on resolving those issues before moving forward with
                      any additional feature development.
                    </span>
                  </div>

                  <div>
                    <span className="text-pink-500 font-medium">[00:50]</span>
                    <span className="text-gray-600 ml-2">
                      All action items and estimated timelines have been assigned.
                    </span>
                  </div>

                  <div>
                    <span className="text-pink-500 font-medium">[01:00]</span>
                    <span className="text-gray-600 ml-2">
                      If anything is unclear or if you run into any blockers yourselves, feel free to message me
                      directly or drop a note in the project channel. Thanks again everyone for the great work!
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="mt-4">
                <div className="text-sm text-gray-600">
                  <p>Video metadata content would go here...</p>
                </div>
              </TabsContent>

              <TabsContent value="viewers" className="mt-4">
                <div className="text-sm text-gray-600">
                  <p>Viewers information would go here...</p>
                </div>
              </TabsContent>

              <TabsContent value="chapters" className="mt-4">
                <div className="text-sm text-gray-600">
                  <p>Video chapters would go here...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
    </main>
  )
}

export default VideoDetailsPage
