import { ProductCardProps, ReorderStockContainerProps, StockContainerProductCardProps } from '@/interface/ComponentProps'
import {
    ProductCardContainer,
    CardHeader,
    StatusPill,
    InfoRow,
    InfoLabel,
    ButtonGroup,
    StatusPillStockContainerExpiring
} from '@/styles/components/ProductCard.style'
import React from 'react'
import { AppButton } from './BaseButton'
import Edit from '@/assets/edit.svg'
import { Paragraph } from './Paragraph'



// component for main product card
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
    onRemove,
    onButton
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

                    {
                        onButton && (
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
                        )
                    }
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



// component for stock product container card
export const StockContainerProductCard: React.FC<StockContainerProductCardProps> = ({
    name,
    quantity,
    category,
    supplier,
    expiryDate,
    expiresInDays,
    minStock,
    currentStock,
    container,
    unit
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
                            {container === "expiringSoon" && (
                                <StatusPill>Expires in {expiresInDays} days</StatusPill>
                            )}
                            {expiresInDays && container === "lowStockItems" && (
                                <StatusPillStockContainerExpiring>Low Stock</StatusPillStockContainerExpiring>
                            )}
                        </div>
                    </div>
                </CardHeader>
                {/* INFO ROWS */}
                <InfoRow>
                    {
                        container !== 'lowStockItems' && (
                            <>
                                <InfoLabel>Quantity:</InfoLabel>
                                <span>{quantity} {unit}</span>
                            </>
                        )
                    }
                    {
                        container === 'lowStockItems' && (
                            <>
                                <InfoLabel>Current Stock :</InfoLabel>
                                <span className='text-red-600'>{currentStock} {unit}</span>
                            </>
                        )
                    }

                    {
                        container !== 'lowStockItems' && (
                            <>
                                <InfoLabel>Expiry Date:</InfoLabel>
                                <span>{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</span>
                            </>
                        )
                    }
                    {
                        container === 'lowStockItems' && (
                            <>
                                <InfoLabel>Min Required:</InfoLabel>
                                <span>{minStock} {unit}</span>
                            </>
                        )
                    }
                </InfoRow>
                <InfoRow>
                    <InfoLabel>Category:</InfoLabel>
                    <span>{category}</span>

                    <InfoLabel>Supplier:</InfoLabel>
                    <span>{supplier}</span>
                </InfoRow>
            </ProductCardContainer>
        </>
    )
}


// component for stocks that needs to be reordered
export const ReOrderStockContainerProductCard: React.FC<ReorderStockContainerProps> = ({
    name,
    supplier,
    minStock,
    currentStock,
    unit
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
                    </div>
                </CardHeader>


                <InfoRow>
                    <InfoLabel>Current:</InfoLabel>
                    <span>{currentStock}{unit}</span>

                    <InfoLabel>Min Stock:</InfoLabel>
                    <span>{minStock} {unit}</span>
                </InfoRow>

                <InfoRow>
                    <InfoLabel>Supply:</InfoLabel>
                    <span>{supplier}</span>
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