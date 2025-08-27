'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ProfileModal } from '../student-profile/ProfileModal'

interface ConfigurationHeaderProps {
  subHeader: string
  title: string
  userImg?: string
}

const ConfigurationHeader = ({ subHeader, title, userImg }: ConfigurationHeaderProps) => {
  const [showViewModal, setShowViewModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateProfile = async () => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
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
              <p>{subHeader}</p>
              <h1>{title}</h1>
            </article>
          </div>

          <aside>
            <button 
              onClick={handleViewProfileClick}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Image src="/assets/icons/users.svg" 
                alt="view" width={16} height={16} />
              <span>View profiles</span>
            </button>
            <div className="record">
              <button 
                className="primary-btn"
                onClick={() => setShowGenerateModal(true)}
              >
                <Image src="/assets/icons/wand.svg" alt="generate" width={16} height={16}></Image>
                <span>Generate profiles</span>
              </button>
            </div>
          </aside>
        </section>
        
        {/* Separator line */}
        <div className="border-b border-gray-200"></div>
      </header>

      {/* View Profile Modal */}
      <ProfileModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Student Learning Profiles"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                name: "Confused Persistent Beginner",
                description: "A beginning student who struggles with recursion and complex algorithms but shows high persistence. Asks for help after multiple failed attempts and gets excited about small wins."
              },
              {
                id: 2,
                name: "Overconfident Intermediate",
                description: "An intermediate student who often overestimates their understanding and jumps ahead too quickly. Benefits from challenging questions that reveal knowledge gaps."
              },
              {
                id: 3,
                name: "Anxious High Achiever",
                description: "A capable student who seeks constant validation and worries about making mistakes. Asks many clarifying questions and responds well to encouragement."
              },
              {
                id: 4,
                name: "Independent Problem Solver",
                description: "A self-directed learner who prefers to work through problems alone. Only asks for help when truly stuck and values concise hints over detailed explanations."
              },
              {
                id: 5,
                name: "Visual Concrete Thinker",
                description: "A student who learns best through diagrams and concrete examples. Struggles with abstract concepts but excels with visual guides and step-by-step walkthroughs."
              },
              {
                id: 6,
                name: "Quick Conceptual Learner",
                description: "An advanced student who grasps concepts quickly but sometimes lacks attention to details. Benefits from high-level explanations and challenging extensions."
              }
            ].map((profile) => (
              <div key={profile.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    S{profile.id}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ProfileModal>

      {/* Generate Profile Modal */}
      <ProfileModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Authentic Student Profiles"
      >
        <div className="space-y-6">
          <div className="text-gray-600">
            <p className="mb-4">
              Generate authentic student behavioral profiles by analyzing real learning session data, 
              conversation patterns, concept map progression, and interaction behaviors to create 
              realistic student personas for pedagogical testing.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-green-900 mb-3">Profile Template:</h3>
              <div className="bg-white border border-green-300 rounded-md p-3 text-xs font-mono overflow-x-auto">
                <pre className="text-green-800">
{`{
  "profileId": "id",
  "knowledgeComponents": { // KLI Framework https://arxiv.org/pdf/2405.11591
    "basic_programming": "mastered",
    "recursion": "confused", 
    "iteration": "mastered",
    "data_structures": "unknown",
    "algorithms": "unknown"
  },
  "misconceptions": {
    "recursion": ["thinks recursion is just loops", "unclear about base cases"],
    "data_structures": []
  },
  "studentTraits": { // From Teach Tune https://arxiv.org/pdf/2410.04078
    "academic_self_efficacy": 2,     // 1-5 scale (low confidence)
    "intrinsic_motivation": 4,       // 1-5 scale (high motivation)  
    "academic_stress": 3,            // 1-5 scale (moderate stress)
    "goal_commitment": 4             // 1-5 scale (high commitment)
  },
  "interactionPatterns": { // Pulled directly from data
    "frequency": "high",             // high/medium/low from conversation logs
    "session_consistency": "regular" // regular/sporadic/declining
  },
  "emotionalIndicators": { // Pulled directly from data
    "frustration_level": "medium",   // from sentiment analysis of messages
    "confidence_level": "low",       // "I think maybe?" vs "It's definitely X"
    "excitement_level": "high"       // "Cool!" "That worked!" frequency
  },
  "helpSeekingBehavior": { // Pulled directly from data
    "debugging_help": "frequent",    // "Why doesn't this work?"
    "conceptual_help": "occasional", // "What is recursion?"
    "optimization_help": "never",    // "How to make this faster?"
    "syntax_help": "rare",          // "What's the right syntax?"
    "trigger_point": "after 2-3 attempts" // when they ask for help
  }
}`}
                </pre>
              </div>
            </div>
          </div>
          
          {isGenerating && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Extracting behavioral patterns...</p>
              <p className="text-sm text-gray-500 mt-1">Analyzing authentic conversation data</p>
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

export default ConfigurationHeader