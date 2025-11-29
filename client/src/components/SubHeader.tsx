import React from 'react'
import { TextProps } from '@/interface/ComponentProps'
import { MiniSubHeading, SubHeading } from '@/styles/components/Text.style'

export const SubHeader: React.FC<TextProps> = ({ text, className }) => {
    return (
        <>
            <SubHeading className={className} data-testid="sub-header">
                {text}
            </SubHeading>
        </>
    )
}

export const MiniSubHeader: React.FC<TextProps> = ({ text, className }) => {
    return (
        <>
            <MiniSubHeading className={className} data-testid="mini-subheader">
                {text}
            </MiniSubHeading>
        </>
    )
}