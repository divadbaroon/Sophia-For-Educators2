"use client"

import type React from "react"
import { Menu } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function ReplayNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md shadow-lg mb-4">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/home" className="text-3xl font-bold mr-8 text-black ml-1">
              Sophia<span className="text-blue-600">.</span>
            </Link>
            <div className="hidden md:flex space-x-6 mt-2">
              <Link
                href="/configuration"
                className="text-gray-900 hover:text-blue-600 transition-colors duration-200 relative group cursor-pointer"
              >
                Configuration
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform transition-transform duration-200 scale-x-0 group-hover:scale-x-100" />
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
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
          
          <button 
            className="md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            aria-label="Toggle menu"
          >
            <Menu className="text-gray-900" />
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 backdrop-blur-md bg-white/90">
            <Link
              href="/configuration"
              className="block px-4 py-2 text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              Configuration
            </Link>
            
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/assets/Icons/accountIcon.png" alt="Account" />
                  </Avatar>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">user@example.com</p>
                </div>
              </div>
              <div className="mt-3 px-4">
                <button className="w-full text-left py-2 text-gray-900 hover:bg-blue-50 rounded">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}