export interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}