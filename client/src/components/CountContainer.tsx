import { CountBox } from '@/styles/components/shared.style'
import React from 'react'
import { MiniSubHeader } from './SubHeader';
import { Paragraph } from './Paragraph';
import { Header } from './Header';


interface CountContainerProps {
    heading: string;
    figures: string;
    description?: string;
    container?: 'red' | 'yellow' | 'green';
}


export const CountContainer: React.FC<CountContainerProps> = ({
    heading,
    figures,
    description,
    container
}) => {


    return (
        <CountBox $container={container}>
            <div className="containerHeading">
                <MiniSubHeader
                    text={heading}
                    className='font-medium'
                />
            </div>
            <div className="bottomBox">
                <Header
                    text={figures}
                />
                <Paragraph
                    text={description}
                />
            </div>
        </CountBox>
    )
}