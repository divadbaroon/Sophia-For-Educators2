import React from 'react'
import Image from 'next/image'

import DropdownList from './MultipleDropdownLists'

interface SharedHeaderProps {
  subHeader: string
  title: string
  userImg?: string
  onFiltersChange?: (filters: any) => void
  availableLessons?: string[]  
}

const Header = ({ subHeader, title, userImg, onFiltersChange, availableLessons }: SharedHeaderProps) => {
  return (
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
  )
}

export default Header