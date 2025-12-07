import { CountBox } from '@/styles/components/shared.style'
import React from 'react'
import { MiniSubHeader, SubHeader } from './SubHeader';
import { Paragraph } from './Paragraph';


interface CountContainerProps {
    heading: string;
    figures: string;
    description?: string;
}


export const CountContainer: React.FC<CountContainerProps> = ({
    heading,
    figures,
    description
}) => {


    return (
        <CountBox>
            <div className="containerHeading">
                <MiniSubHeader
                    text={heading}
                    className='font-medium'
                />
            </div>
            <div className="bottomBox">
                <SubHeader
                    text={figures}
                />
                <Paragraph
                    text={description}
                />
            </div>
        </CountBox>
    )
}