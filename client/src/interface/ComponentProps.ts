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