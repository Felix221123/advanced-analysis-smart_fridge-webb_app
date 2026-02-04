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
import { useAuth } from '@/context/useAuth'
import { expiryLabel } from '@/utils/date'


const formatDateTime = (value: string | Date | null | undefined): string => {
    if (!value) return '—';
    const d = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
};



// component for main product card
export const ProductCard: React.FC<ProductCardProps> = ({
    name,
    quantity,
    unit,
    supplier,
    minStock,
    activityLabel = 'No activity',
    activityBy,
    activityAt,
    runningLow,
    expiresInDays,
    onEdit,
    onRemove,
    onButton,
    unlock_items
}) => {
    const { user } = useAuth();

    const activityTime = formatDateTime(activityAt);
    const activityPerson = activityBy ?? '—';

    // const showExpiry = typeof expiresInDays === 'number';


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
                            {typeof expiresInDays === "number" && (
                                <StatusPill>{expiryLabel(expiresInDays)}</StatusPill>
                            )}

                        </div>
                    </div>

                    {
                        onButton && (
                            <ButtonGroup>
                                {
                                    unlock_items
                                }
                                <AppButton
                                    variant='outline'
                                    text='Edit'
                                    onClick={onEdit}
                                    icon={<EditIcon />}
                                />
                                {
                                    user?.role !== 'DELIVERY_PERSON' && (
                                        <AppButton
                                            variant='outline'
                                            text='-  Remove'
                                            onClick={onRemove}
                                        />
                                    )
                                }
                            </ButtonGroup>
                        )
                    }
                </CardHeader>

                {/* INFO ROWS */}
                <InfoRow>
                    <InfoLabel>Quantity:</InfoLabel>
                    <span>{quantity} {unit}</span>

                    <InfoLabel>Supplier:</InfoLabel>
                    <span>{supplier}</span>

                    <InfoLabel>Min Stock:</InfoLabel>
                    <span>{minStock} {unit}</span>
                </InfoRow>

                <InfoRow className="added-by">
                    <span>
                        {activityLabel}: {activityPerson} • {activityTime}
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
                            {container === "expiringSoon" && typeof expiresInDays === "number" && (
                                <StatusPill>{expiryLabel(expiresInDays)}</StatusPill>
                            )}

                            {container === "lowStockItems" && (
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
                                <span>{expiryDate ?? 'N/A'}</span>
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
    unit,
    ordered,
    orderStatus,
    orderedFrom,
    qtyRequested,
    qtyDelivered,
}) => {

    const pillText = ordered ? (orderStatus === "SENT" ? "ORDER SENT" :
        orderStatus === "PARTIALLY_DELIVERED" ? "PART DELIVERED" :
            "ORDER ISSUED") : "NEEDS ORDER";



    return (
        <>
            <ProductCardContainer style={{
                opacity: ordered ? 0.85 : 1,
                border: ordered ? "1px solid #d9e6ff" : "1px solid #eee",
                background: ordered ? "#f6f9ff" : "white",
            }}>
                <CardHeader>
                    <div className="itemNameContainer">
                        <Paragraph text={name} className="item_name font-bold" />
                    </div>

                    <span style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        border: ordered ? "1px solid #a9c5ff" : "1px solid #ffd39a",
                        background: ordered ? "#eaf1ff" : "#fff4e5",
                    }}>
                        {pillText}
                    </span>
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

                {ordered && (
                    <InfoRow>
                        <InfoLabel>Ordered:</InfoLabel>
                        <span>
                            {qtyRequested ?? "—"}{unit}
                            {typeof qtyDelivered === "number" ? ` • Delivered: ${qtyDelivered}${unit}` : ""}
                            {orderedFrom ? ` • ${orderedFrom}` : ""}
                        </span>
                    </InfoRow>
                )}
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