import React from 'react'
import { PreloaderContainer, Wrap, Ball } from '@/styles/components/Loading.style'


export const Loading: React.FC = () => {
    return (
        <>
            <PreloaderContainer>
                <Wrap>
                    {[0, 1, 2].map(index => (
                        <Ball key={index} index={index} />
                    ))}
                </Wrap>
            </PreloaderContainer>
        </>
    )
}