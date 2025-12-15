import { ModalContainer } from '@/styles/components/Modal.style'
import React from 'react'
import { Paragraph } from './Paragraph'
import { AppButton } from './BaseButton'
import { Header } from './Header'



interface DeleteModalProps {
    container: 'user' | 'item'
    onClose: () => void
}





export const DeleteModal: React.FC<DeleteModalProps> = ({
    container, onClose
}) => {

    return (
        <>
            <ModalContainer>
                <div className="delete_container">
                    <Header
                        text={container == 'user' ? 'Delete User Account' : 'Delete Item'}
                    />
                    <Paragraph
                        text={container === 'user' ? 'Are you sure you want to delete this user account from the system?' :
                            'Are you sure you want to delete this item from the fridge?'
                        }
                    />
                    <div className="buttonContainer">
                        <AppButton
                            text="Cancel"
                            onClick={onClose}
                            variant='outline'
                            fullWidth={true}
                            type="button"
                        />
                        <AppButton
                            text={container === 'user' ? 'Delete Account' : 'Delete Item'}
                            onClick={() => { }}
                            variant="primary"
                            fullWidth={true}
                        />
                    </div>
                </div>
            </ModalContainer>
        </>
    )
}

