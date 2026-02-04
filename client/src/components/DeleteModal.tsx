import { ModalContainer } from '@/styles/components/Modal.style'
import React, { useEffect, useState } from 'react'
import { Paragraph } from './Paragraph'
import { AppButton } from './BaseButton'
import { Header } from './Header'
import { DeleteUserApi } from '@/packages/api/UserApi'
import { MessageSuccess } from './MessageModal'
import { DeleteProductApi } from '@/packages/api/ServicesApi'


interface DeleteModalProps {
    container: 'user' | 'item';
    targetId: string;
    onClose: () => void;
    onSuccess?: () => void;
    userId?: string
}





export const DeleteModal: React.FC<DeleteModalProps> = ({
    container, onClose, targetId, onSuccess, userId
}) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState<boolean>(false);

    console.log(targetId, ' is the target id')


    useEffect(() => {
        if (!success) return

        const timer = setTimeout(() => {
            setSuccess(false)
            onClose()
        }, 8500)

        return () => clearTimeout(timer)
    }, [success, onClose])

    const handleDelete = async () => {
        setLoading(true)
        setError('')

        try {
            if (!targetId) {
                setError('Missing target id.')
                return
            }

            if (container === 'user') {
                const response = await DeleteUserApi(targetId)
                if (response) {
                    onSuccess?.()
                    setSuccess(true)
                }
                return
            }

            // / container === 'item'
            if (!userId) {
                setError('Missing user id for deleting item.')
                return
            }

            const response = await DeleteProductApi(userId, targetId)
            if (response) {
                onSuccess?.() // refresh list etc.
                setSuccess(true)
            }
        } catch (err: any) {
            setError(
                err?.detail ||
                err?.message ||
                (container === 'user'
                    ? 'Could not delete user'
                    : 'Could not delete item')
            )
        } finally {
            setLoading(false)
        }
    }


    return (
        <>
            {
                !success ? (
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
                            {error && <p style={{ color: "red", marginBottom: "10px" }} className='text-sm'>{error}</p>}
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
                                    onClick={handleDelete}
                                    variant="primary"
                                    fullWidth={true}
                                    disabled={loading}
                                    type='submit'
                                />
                            </div>
                        </div>
                    </ModalContainer>
                ) : (
                    <MessageSuccess
                        title={container === 'user' ? 'Account deleted successfully' : 'Item deleted successfully'}
                        description={
                            container === 'user'
                                ? `This is to confirm that account has been successfully deleted`
                                : `This is to confirm that item has been successfully deleted`
                        }
                    />
                )
            }
        </>
    )
}

