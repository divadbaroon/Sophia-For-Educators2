'use client'

import React, { useState } from 'react'
import Image from 'next/image'

import DropdownList from './MultipleDropdownLists'
import { ProfileModal } from './ProfileModal'

interface SharedHeaderProps {
  subHeader: string
  title: string
  userImg?: string
  onFiltersChange?: (filters: any) => void
  availableLessons?: string[]  
}

const Header = ({ subHeader, title, userImg, onFiltersChange, availableLessons }: SharedHeaderProps) => {
  const [showViewModal, setShowViewModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateProfile = async () => {
    setIsGenerating(true)
    // Simulate API call for generating profile
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      // Handle successful generation here
      console.log('Profile generated successfully!')
    } catch (error) {
      console.error('Error generating profile:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleViewProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowViewModal(true)
  }

  return (
    <>
      <header className="header">
          <section className="header-container">
              <div className="details">
                  {userImg && (
                      <Image src={userImg} 
                      alt="user" width={66} height={66} className="rounded-full"/>
                  )}

                  <article>
                      <p>
                          {subHeader}
                      </p>
                      <h1>
                          {title}
                      </h1>
                  </article>
              </div>

               <aside>
                <button 
                  onClick={handleViewProfileClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Image src="/assets/icons/users.svg" 
                    alt="view" width={16} height={16} />
                    <span>
                        View profiles
                    </span>
                </button>
                <div className="record">
                    <button 
                      className="primary-btn"
                      onClick={() => setShowGenerateModal(true)}
                    >
                        <Image src="/assets/icons/wand.svg" alt="generate" width={16} height={16}></Image>
                        <span>
                            Generate profiles
                        </span>
                    </button>
                </div>
            </aside>
          </section>

          <section className="search-filter">
              <div className="search">
                  <input 
                      type="text"
                      placeholder="Search sessions, students, concepts, algorithms..."
                  />
                  <Image src="/assets/icons/search.svg" alt="search"
                  width={16} height={16} />
              </div>

              <DropdownList onFiltersChange={onFiltersChange} availableLessons={availableLessons} />
          </section>
      </header>

      {/* View Profile Modal */}
      <ProfileModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Student Learning Profiles"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample profile cards */}
            {[1, 2, 3, 4, 5, 6].map((profileId) => (
              <div key={profileId} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    S{profileId}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Student {profileId}</h3>
                    <p className="text-sm text-gray-500">12 sessions completed</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Learning Style:</span>
                    <span className="font-medium">Visual + Kinesthetic</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proficiency:</span>
                    <span className="font-medium text-green-600">Intermediate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Focus Area:</span>
                    <span className="font-medium">Data Structures</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Full Profile →
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Profile Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-blue-800 font-semibold text-lg">24</div>
                <div className="text-blue-600">Total Students</div>
              </div>
              <div>
                <div className="text-blue-800 font-semibold text-lg">156</div>
                <div className="text-blue-600">Total Sessions</div>
              </div>
              <div>
                <div className="text-blue-800 font-semibold text-lg">78%</div>
                <div className="text-blue-600">Avg. Completion</div>
              </div>
              <div>
                <div className="text-blue-800 font-semibold text-lg">4.2/5</div>
                <div className="text-blue-600">Avg. Rating</div>
              </div>
            </div>
          </div>
        </div>
      </ProfileModal>

      {/* Generate Profile Modal */}
      <ProfileModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Learning Profiles"
      >
        <div className="space-y-6">
          <div className="text-gray-600">
            <p className="mb-4">
              Generate comprehensive learning profiles based on student session data, 
              coding patterns, problem-solving approaches, and progress metrics.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-3">Profile Analysis Includes:</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
                <ul className="space-y-1">
                  <li>• Learning style assessment</li>
                  <li>• Coding proficiency evaluation</li>
                  <li>• Problem-solving patterns</li>
                  <li>• Time management analysis</li>
                </ul>
                <ul className="space-y-1">
                  <li>• Concept mastery tracking</li>
                  <li>• Error pattern recognition</li>
                  <li>• Engagement metrics</li>
                  <li>• Personalized recommendations</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-amber-900 mb-2">⚡ Processing Information</h3>
              <p className="text-sm text-amber-800">
                This process will analyze all available session data including code snapshots, 
                interaction patterns, test results, and time spent on different concepts.
              </p>
            </div>
          </div>
          
          {isGenerating && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Generating profiles...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few minutes</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowGenerateModal(false)}
              disabled={isGenerating}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateProfile}
              disabled={isGenerating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[140px] justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Image src="/assets/icons/wand.svg" alt="generate" width={16} height={16} className="filter invert" />
                  <span>Generate Profiles</span>
                </>
              )}
            </button>
          </div>
        </div>
      </ProfileModal>
    </>
  )
}

export default Header