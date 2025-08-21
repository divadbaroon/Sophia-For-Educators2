"use client"

import { useState } from "react"

import SingleDropdown  from "./SingleDropDownLists"

interface MultipleFiltersProps {
    onFiltersChange?: (filters: FilterState) => void
}

interface FilterState {
    sortBy: string
    messageFilter: string
    durationFilter: string
    lessonSort: string
}

const MultipleFilters = ({ onFiltersChange }: MultipleFiltersProps) => {
    const [filters, setFilters] = useState<FilterState>({
        sortBy: 'Date',
        messageFilter: 'Messages', 
        durationFilter: 'Duration',
        lessonSort: 'Lesson'
    })

    const updateFilter = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFiltersChange?.(newFilters)
    }

    const sortOptions = ['Most recent', 'Oldest', 'Most recently completed']
    const messageOptions = ['All', 'Has messages', 'No messages']
    const durationOptions = ['All', 'Longest duration', 'Shortest duration']
    const lessonOptions = ['Default', 'A-Z', 'Z-A']

    return (
        <div className="flex gap-4 items-center">
            <SingleDropdown
                label="Sort by"
                options={sortOptions}
                selectedValue={filters.sortBy}
                onValueChange={(value) => updateFilter('sortBy', value)}
            />
            
            <SingleDropdown
                label="Messages"
                options={messageOptions}
                selectedValue={filters.messageFilter}
                onValueChange={(value) => updateFilter('messageFilter', value)}
            />
            
            <SingleDropdown
                label="Duration"
                options={durationOptions}
                selectedValue={filters.durationFilter}
                onValueChange={(value) => updateFilter('durationFilter', value)}
            />
            
            <SingleDropdown
                label="Lesson"
                options={lessonOptions}
                selectedValue={filters.lessonSort}
                onValueChange={(value) => updateFilter('lessonSort', value)}
            />
        </div>
    )
}

export default MultipleFilters