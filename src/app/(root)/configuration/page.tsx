import React from 'react'

import Header from "@/components/header/Header"

const page = () => {
  return (
     <main className="wrapper page">
        <Header 
          title="Agent Configuration" 
          subHeader="" 
        />
        <div className="text-center py-8">Loading sessions...</div>
      </main>
  )
}

export default page