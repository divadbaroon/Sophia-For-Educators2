export interface MultipleFiltersProps {
    onFiltersChange?: (filters: FilterState) => void
    availableLessons?: string[] 
}

export interface FilterState {
    sortBy: string
    messageFilter: string
    durationFilter: string
    lessonSort: string
}

export interface SingleDropdownProps {
    label: string
    options: string[]
    selectedValue: string
    onValueChange: (value: string) => void
    placeholder?: string
}