import { ProductCardProps } from '@/interface/ComponentProps'
import {
    ProductCardContainer,
    CardHeader,
    StatusPill,
    InfoRow,
    InfoLabel,
    ButtonGroup,
} from '@/styles/components/ProductCard.style'
import React from 'react'
import { AppButton } from './BaseButton'
import Edit from '@/assets/edit.svg'
import { Paragraph } from './Paragraph'


export const ProductCard: React.FC<ProductCardProps> = ({
    name,
    quantity,
    unit,
    category,
    supplier,
    minStock,
    addedBy,
    addedAt,
    runningLow,
    expiresInDays,
    onEdit,
    onRemove
}) => {

    return (
        <>
            <ProductCardContainer>
                <CardHeader>
                    <div className="itemNameContainer">
                        <Paragraph
                            text={name}
                            className='item_name font-bold'
                        />

                        <div className="status-area">
                            {runningLow && (
                                <StatusPill>Running Low</StatusPill>
                            )}
                            {expiresInDays && (
                                <StatusPill>Expires in {expiresInDays} days</StatusPill>
                            )}
                        </div>
                    </div>

                    <ButtonGroup>
                        <AppButton
                            variant='outline'
                            text='Edit'
                            onClick={onEdit}
                            icon={<EditIcon />}
                        />
                        <AppButton
                            variant='outline'
                            text='-  Remove'
                            onClick={onRemove}
                        />
                    </ButtonGroup>
                </CardHeader>

                {/* INFO ROWS */}
                <InfoRow>
                    <InfoLabel>Quantity:</InfoLabel>
                    <span>{quantity} {unit}</span>

                    <InfoLabel>Category:</InfoLabel>
                    <span>{category}</span>

                    <InfoLabel>Supplier:</InfoLabel>
                    <span>{supplier}</span>

                    <InfoLabel>Min Stock:</InfoLabel>
                    <span>{minStock} {unit}</span>
                </InfoRow>

                <InfoRow className="added-by">
                    <span>
                        Added by {addedBy} on {new Date(addedAt).toLocaleString()}
                    </span>
                </InfoRow>
            </ProductCardContainer>
        </>
    )
}



export const EditIcon = () => {
    return (
        <>
            <img src={Edit} alt="edit icon" />
        </>
    )
}