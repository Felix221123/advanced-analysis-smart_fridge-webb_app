import React from 'react'
import { ButtonCompStyle, BaseButton } from '@/styles/components/Button.style'
import { ButtonProps } from '@/interface/ComponentProps'


interface CommonButtonProps {
    text: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    variant?: "primary" | "secondary" | "outline" | "success";
    fullWidth?: boolean;
    type?: "button" | "submit" | "reset";
}



// authentication button
export const AuthButton: React.FC<ButtonProps> = ({ text, onClick, className, type, disabled }) => {

    return (
        <>
            <ButtonCompStyle onClick={onClick} className={`${className} text-center`} type={type} data-testid="auth-button" disabled={disabled}>
                {text}
            </ButtonCompStyle>
        </>
    )
}


// application common button component
export const AppButton: React.FC<CommonButtonProps> = ({
    text,
    onClick,
    icon,
    variant = "primary",
    fullWidth = false,
    type = "button",
}) => {
    return (
        <BaseButton
            variant={variant}
            onClick={onClick}
            fullWidth={fullWidth}
            type={type}
            data-testid="app-button"
        >
            {icon && <span>{icon}</span>}
            {text}
        </BaseButton>
    );
};