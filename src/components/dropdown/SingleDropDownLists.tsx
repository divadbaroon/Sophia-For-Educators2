"use client"

import { useState } from "react"

import Image from 'next/image'

import { SingleDropdownProps } from './types'

const SingleDropdown = ({ label, options, selectedValue, onValueChange }: SingleDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleOptionClick = (option: string) => {
        onValueChange(option)
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="filter-trigger">
                    <figure>
                        <Image src="/assets/icons/hamburger.svg" alt="menu" width={14} height={14} />
                        {selectedValue === 'All' ? label : selectedValue}
                    </figure>
                    <Image src="/assets/icons/arrow-down.svg" alt="arrow-down" width={20} height={20} />
                </div>

                {isOpen && (
                    <ul className="dropdown">
                        {options.map((option) => (
                            <li 
                                key={option} 
                                className={`list-item ${selectedValue === option ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(option)}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default SingleDropdown