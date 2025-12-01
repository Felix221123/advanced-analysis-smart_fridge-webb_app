import React from 'react'
import {
    ModalContainer,
    ItemModalContainer
} from '@/styles/components/Modal.style'
import { SubHeader } from './SubHeader'
import { Paragraph } from './Paragraph'
import closeBtn from '@/assets/closeBtn.svg'
import { ItemModalProps } from '@/interface/ComponentProps'
import { Input } from './Input'
import { AppButton } from './BaseButton'
import CustomSelect, { ObjectSelectOptions } from './CustomSelect'
import { roleHeading } from '@/constants/roleHeading'



export const ItemModal: React.FC<ItemModalProps> = (
    { title, description, onClose, newItem }
) => {


    return (
        <>
            <ModalContainer>
                <ItemModalContainer>
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
                                    text="Item Name"
                                    className='text-left font-bold'
                                />
                                <Input
                                    id="itemName"
                                    type="text"
                                    placeholder="eg. Fresh Salmon Fillets"
                                    className='text-left'
                                    required={true}
                                    data-testid='itemName'
                                />
                            </div>
                            <div className="form-group">
                                <div className="container">
                                    <Paragraph
                                        text="Category"
                                        className='text-left font-bold'
                                    />
                                    <CustomSelect >
                                        <option value="">Select category</option>
                                        <ObjectSelectOptions data={roleHeading} />
                                    </CustomSelect>
                                </div>
                                <div className="container">
                                    <Paragraph
                                        text="Supplier"
                                        className='text-left font-bold'
                                    />
                                    <CustomSelect >
                                        <option value="">Select supplier</option>
                                        <ObjectSelectOptions data={roleHeading} />
                                    </CustomSelect>
                                </div>

                            </div>
                            <div className="form-group">
                                <div className="container">
                                    <Paragraph
                                        text="Quantity"
                                        className='text-left font-bold'
                                    />
                                    <Input
                                        id="quantity"
                                        type="text"
                                        placeholder="0.00"
                                        className='text-left'
                                        required={true}
                                    />
                                </div>
                                <div className="container">
                                    <Paragraph
                                        text="Unit"
                                        className='text-left font-bold'
                                    />
                                    <CustomSelect >
                                        <option value="">Select unit</option>
                                        <ObjectSelectOptions data={roleHeading} />
                                    </CustomSelect>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="container">
                                    <Paragraph
                                        text="Date"
                                        className='text-left font-bold'
                                    />
                                    <Input
                                        id="min_quantity"
                                        type="date"
                                        placeholder="dd/mm/yyyy"
                                        className='text-left'
                                        required={true}
                                    />
                                </div>
                                <div className="container">
                                    <Paragraph
                                        text="Minimum Quantity"
                                        className='text-left font-bold'
                                    />
                                    <Input
                                        id="min_quantity"
                                        type="text"
                                        placeholder="0.00"
                                        className='text-left'
                                        required={true}
                                    />
                                </div>
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
                                    text={newItem ? 'Add Item' : 'Update Item'}
                                    onClick={() => { }}
                                    variant="primary"
                                    fullWidth={true}
                                    type={newItem ? 'submit' : 'button'}
                                />
                            </div>
                        </form>
                    </div>
                </ItemModalContainer>
            </ModalContainer>
        </>
    )
}

