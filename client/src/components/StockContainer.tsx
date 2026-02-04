import React from 'react'
import LowStock from '@/assets/inventory.svg'
import {
    StockBox,
    TabContainer
} from '@/styles/components/shared.style'
import { SubHeader } from './SubHeader'
import { Paragraph } from './Paragraph'
import ExpiringSoon from '@/assets/simulate_order.svg'
import { StockContainerProductCard } from './ProductCard'
import CheckMark from '@/assets/check_mark.svg'
import Expired from '@/assets/expired_icon.svg'
import { AllFoodItemProps } from '@/interface/ComponentProps'
import { daysUntil, formatDateUK } from '@/utils/date'


// interface for component
interface StockContainerProps {
    container: 'expiringSoon' | 'lowStockItems' | 'complianceItems' | 'expired',
    title: string,
    description: string,

    items: AllFoodItemProps[];
    loading?: boolean;
    error?: string | null;
    emptyText?: string;
}


export const StockContainer: React.FC<StockContainerProps> = ({
    container,
    title,
    description,
    items,
    loading = false,
    error = null,
    emptyText = "No items to display.",
}) => {


    return (
        <>
            <TabContainer $container={container}>
                <StockBox>
                    <div className="heading">
                        <div className="tabHeader">
                            <div className="headerIcon">
                                {container === 'expiringSoon' && <ExpiringSoonIcon />}
                                {container === 'lowStockItems' && <LowStockItemsIcon />}
                                {container === 'complianceItems' && <ComplianceItemsIcon />}
                                {container === 'expired' && <ExpiredItemsIcon />}

                                <SubHeader
                                    text={title}
                                    className='font-bold'
                                />
                            </div>
                            <Paragraph
                                text={description}
                            />
                        </div>
                    </div>

                    {/* items in stock */}
                    <div className="stocksContainer">
                        <div className="scrollable">
                            {/* array product map listing here */}
                            {error && <p className="text-sm" style={{ color: "red" }}>{error}</p>}
                            {loading && <p className="text-sm">Loading...</p>}

                            {!loading && items.length === 0 && (
                                <p className="text-sm">{emptyText}</p>
                            )}

                            {!loading && items.map((p) => {
                                const expiresInDays = daysUntil(p.expiry_date);
                                const qty = Number(p.qty_total ?? 0);
                                const min = Number(p.reorder_point ?? 0);

                                return (
                                    <StockContainerProductCard
                                        key={p.id}
                                        name={p.name}
                                        quantity={qty}
                                        unit={p.unit}
                                        supplier={p.supplier_name ?? "—"}
                                        expiresInDays={expiresInDays ?? undefined}
                                        container={container}
                                        expiryDate={formatDateUK(p.expiry_date)}
                                        minStock={min}
                                        currentStock={qty}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </StockBox>
            </TabContainer>
        </>
    )
}


export const ExpiringSoonIcon = () => {
    return <img src={ExpiringSoon} alt="items expiring soon on the menu" />
}

export const LowStockItemsIcon = () => {
    return <img src={LowStock} alt="low stocks items" />
}

export const ComplianceItemsIcon = () => {
    return <img src={CheckMark} alt="compliance items" />
}

export const ExpiredItemsIcon = () => {
    return <img src={Expired} alt="compliance items" />
}
