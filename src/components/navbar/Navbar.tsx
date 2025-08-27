"use client"

import React from 'react'
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/(auth)/login/actions"

interface User {
  email?: string
  id: string
  name?: string
}

type NavItem = {
  name: string
  href: string
}

interface NavbarProps {
  user: User | null
}

const Navbar = ({ user }: NavbarProps) => {
  const pathname = usePathname()
  const router = useRouter()

  // Check if the current path matches the session join pattern or contains "session"
  const isSessionPage = pathname.includes("/join") || pathname.includes("session")

  const navigationItems: (string | NavItem)[] = isSessionPage
    ? []
    : user
      ? [
          { name: "Configure", href: "/configuration" },
          { name: "Replay", href: "/replays" },
        ]
      : []

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    
    // Check if we're on login or signup pages
    const isAuthPage = pathname.includes("/login") || pathname.includes("/sign-up") 
    
    if (isAuthPage) {
      // Redirect to home page with hash
      router.push(`/home#${targetId}`)
    } else {
      // Normal smooth scroll behavior
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }
  }

  return (
    <header className="navbar"> 
      <nav>
        <div className="flex items-center">
          <Link href="/home" className="text-3xl font-bold text-black" style={{fontWeight: 730}}>
            Sophia<span className="text-blue-600">.</span>
          </Link>
          
          {/* Navigation Items */}
          <div className="hidden md:flex space-x-6 ml-2 mt-2">
            {navigationItems.map((item) => (
            <a
              key={typeof item === "string" ? item : item.name}
              href={typeof item === "string" ? `#${item.toLowerCase().replace(/\s+/g, "-")}` : item.href}
              onClick={
                typeof item === "string"
                  ? (e) => handleSmoothScroll(e, item.toLowerCase().replace(/\s+/g, "-"))
                  : undefined
              }
              className={`text-gray-900 hover:text-blue-600 transition-colors duration-200 relative group cursor-pointer ${
                typeof item !== "string" && pathname === item.href ? "text-blue-600" : ""
              }`}
            >
              {typeof item === "string" ? item : item.name}
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform transition-transform duration-200 ${
                  typeof item !== "string" && pathname === item.href
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </a>
                      ))}
          </div>
        </div>

        {user ? (
          <figure>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer">
                  <Image 
                    src="/assets/icons/accountIcon.png" 
                    alt="User" 
                    width={36} 
                    height={36} 
                    className="rounded-full aspect-square"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-none">
                      {user.email ? user.email : "Guest Account"}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <form action="/" method="POST" className="w-full">
                    <button className="w-full text-left" formAction={signOut}>
                      Sign Out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </figure>
        ) : (
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="text-dark-100 hover:scale-105 transition-transform duration-200">
              <Link href="/login">Sign In</Link>
            </Button>
            <Link
              href="/sign-up"
              className="bg-pink-100 text-white px-6 py-2 rounded-4xl hover:bg-pink-100/80 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar