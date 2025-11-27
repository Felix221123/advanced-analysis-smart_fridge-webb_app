import React from 'react'
import { Heading } from '@/styles/components/Text.style'
import { TextProps } from '@/interface/ComponentProps'

export const Header: React.FC<TextProps> = ({ className, text}) => {
    return (
        <Heading className={className} data-testid="header">
            {text}
        </Heading>
    )
}

