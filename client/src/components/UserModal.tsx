import React from 'react'
import { UserModalProps } from '@/interface/ComponentProps'
import { SubHeader } from './SubHeader'
import { Paragraph } from './Paragraph'
import { 
    ModalContainer, 
    UserModalContainer 
} from '@/styles/components/Modal.style'
import closeBtn from '@/assets/closeBtn.svg'
import { Input } from './Input'
import { AppButton } from './BaseButton'
import CustomSelect, { ObjectSelectOptions } from './CustomSelect'
import { roleHeading } from '@/constants/roleHeading'



export const UserModal: React.FC<UserModalProps> = ({
    title, description, onClose, newUser
}) => {


    return (
        <>
            <ModalContainer>
                <UserModalContainer>
                    <div className="container">
                        <div className="heading" data-testid='heading'>
                            <SubHeader
                                text={title}
                                className='text-left'
                            />
                            <img
                                src={closeBtn}
                                alt="close"
                                onClick={onClose}
                                className='cursor-pointer'
                            />
                        </div>
                        <div className="content">
                            <Paragraph
                                text={description}
                                className='text-left'
                            />
                        </div>
                    </div>
                    <div className="form_container">
                        <form>
                            <div className="form-group">
                                <Paragraph
                                    text="Full Name"
                                    className='text-left font-bold'
                                />
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Full Name"
                                    className='text-left'
                                    required={true}
                                />
                            </div>
                            <div className="form-group">
                                <Paragraph
                                    text="Email"
                                    className='text-left font-bold'
                                />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    className='text-left'
                                />
                            </div>
                            <div className="form-group">
                                <Paragraph
                                    text="Restaurant Name"
                                    className='text-left font-bold'
                                />
                                <CustomSelect >
                                    <option value="">Select Restaurant</option>
                                    <ObjectSelectOptions data={roleHeading} />
                                </CustomSelect>
                            </div>
                            <div className="form-group">
                                <Paragraph
                                    text="Role"
                                    className='text-left font-bold'
                                />
                                <CustomSelect >
                                    <option value="">Select Role</option>
                                    <ObjectSelectOptions data={roleHeading} />
                                </CustomSelect>
                            </div>
                            <div className="form_buttons">
                                <AppButton
                                    text="Cancel"
                                    onClick={onClose}
                                    variant='outline'
                                    fullWidth={true}
                                    type="button"
                                />
                                <AppButton
                                    text={newUser ? 'Create User' : 'Update User'}
                                    onClick={() => { }}
                                    variant="primary"
                                    fullWidth={true}
                                    type={newUser ? 'submit' : 'button'}
                                />
                            </div>
                        </form>
                    </div>
                </UserModalContainer>
            </ModalContainer>
        </>
    )
}

