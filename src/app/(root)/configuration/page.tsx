"use client";

import React, { useState } from 'react'

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Settings } from "lucide-react";

import ConfigurationHeader from "@/components/header/ConfigurationHeader"
import { AgentConfiguration } from "@/components/configuration/AgentConfiguration";

const page = () => {
  const [activeTab, setActiveTab] = useState<"configuration" | "sessions" | "report">("configuration");

  return (
    <main className="wrapper page">
      <ConfigurationHeader 
        title="Agent Configuration" 
        subHeader="" 
      />
      
      <div className="min-h-screen bg-white -mt-2">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Content Card */}
          <Card className="w-full h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("configuration")}
                    className={`h-8 px-4 ${
                      activeTab === "configuration" 
                        ? "bg-black text-white" 
                        : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    Configuration
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("sessions")}
                    className={`h-8 px-4 ${
                      activeTab === "sessions" 
                        ? "bg-black text-white" 
                        : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    Simulated Testing
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("report")}
                    className={`h-8 px-4 ${
                      activeTab === "report" 
                        ? "bg-black text-white" 
                        : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    Performance Report
                  </Button>
                </div>
                {/* Action buttons */}
                {activeTab === "sessions" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5 12a5 5 0 007.54.54l3-3a5 5 0 00-7.54-.54z" />
                      </svg>
                      Voice Settings
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Evaluation Criteria
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {/* Tab Content */}
              <div style={{ display: activeTab === "configuration" ? "block" : "none" }}>
                <AgentConfiguration />
              </div>
              
              <div style={{ display: activeTab === "sessions" ? "block" : "none" }}>
                <div className="text-center py-8">Simulated testing content goes here...</div>
              </div>
              
              <div style={{ display: activeTab === "report" ? "block" : "none" }}>
                <div className="text-center py-8">Performance report content goes here...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default page