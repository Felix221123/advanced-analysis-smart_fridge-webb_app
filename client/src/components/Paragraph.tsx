import React from 'react'
import { TextProps } from '@/interface/ComponentProps'
import { ParagraphStyle } from '@/styles/components/Text.style'

export const Paragraph: React.FC<TextProps> = ({ text, className }) => {
    return (
        <>
            <ParagraphStyle className={className} data-testid="paragraph">
                {text}
            </ParagraphStyle>
        </>
    )
}