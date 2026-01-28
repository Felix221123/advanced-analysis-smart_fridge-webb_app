import React from 'react'
import {
    MessageSuccessModal
} from '@/styles/components/MessageModal.style'
import { Paragraph } from './Paragraph'
import { SubHeader } from './SubHeader'


interface MessageModal {
    title: string,
    description: string
}




export const MessageSuccess: React.FC<MessageModal> = ({ title, description }) => {

    return (
        <>
            <MessageSuccessModal>
                {/* Progress bar */}
                <div className="progressBar" />
                <div className="container">
                    <SubHeader
                        text={title}
                        className='messageHeading text-center font-semibold'
                    />
                    <Paragraph
                        text={description}
                        className='text-center text-white'
                    />
                </div>
            </MessageSuccessModal>
        </>
    )
}