"use client"

import React from 'react'
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/(auth)/login/actions"

interface User {
  email?: string
  id: string
  name?: string
}

interface NavbarProps {
  user: User | null
}

const Navbar = ({ user }: NavbarProps) => {    
    return (
        <header className="navbar"> 
            <nav>
                <Link href="/home" className="text-3xl font-bold mr-8 text-black ml-1">
                    Sophia<span className="text-blue-600">.</span>
                </Link>
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