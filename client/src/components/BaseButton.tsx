import React from 'react'
import { ButtonCompStyle } from '@/styles/components/Button.style'
import { ButtonProps } from '@/interface/ComponentProps'


export const AuthButton: React.FC<ButtonProps> = ({ text, onClick, className, type, disabled }) => {

    return (
        <>
            <ButtonCompStyle onClick={onClick} className={`${className} text-center`} type={type} data-testid="auth-button" disabled={disabled}>
                {text}
            </ButtonCompStyle>
        </>
    )
}