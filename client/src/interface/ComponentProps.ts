// component props
export interface ButtonProps {
    text: string
    onClick?: () => void
    className?: string
    type?: "button" | "reset" | "submit";
    disabled?: boolean
}


// text component props
export interface TextProps {
    text: string | undefined
    className?: string
}

// modal for users
export interface UserModalProps {
    title: string
    description: string
    onClose: () => void
    newUser: boolean
}

// modal for items
export interface ItemModalProps {
    title: string
    description: string
    onClose: () => void
    newItem: boolean
}