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

// interface for component
interface StockContainerProps {
    container: 'expiringSoon' | 'lowStockItems',
    title: string,
    description: string,
}


export const StockContainer: React.FC<StockContainerProps> = ({
    container,
    title,
    description
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
                            <StockContainerProductCard
                                name='Salmon'
                                quantity={10}
                                unit='kg'
                                category='Meat'
                                supplier='Elmi Cow Center'
                                expiresInDays={3}
                                container={container}
                                expiryDate={'22-11-2025'}
                                minStock={5}
                                currentStock={2}
                            />
                            <StockContainerProductCard
                                name='Salmon'
                                quantity={10}
                                unit='kg'
                                category='Meat'
                                supplier='Elmi Cow Center'
                                expiresInDays={3}
                                container={container}
                                expiryDate={'22-11-2025'}
                                minStock={5}
                                currentStock={2}
                            />
                            <StockContainerProductCard
                                name='Salmon'
                                quantity={10}
                                unit='kg'
                                category='Meat'
                                supplier='Elmi Cow Center'
                                expiresInDays={3}
                                container={container}
                                expiryDate={'22-11-2025'}
                                minStock={5}
                                currentStock={2}
                            />
                            <StockContainerProductCard
                                name='Salmon'
                                quantity={10}
                                unit='kg'
                                category='Meat'
                                supplier='Elmi Cow Center'
                                expiresInDays={3}
                                container={container}
                                expiryDate={'22-11-2025'}
                                minStock={5}
                                currentStock={2}
                            />
                            <StockContainerProductCard
                                name='Salmon'
                                quantity={10}
                                unit='kg'
                                category='Meat'
                                supplier='Elmi Cow Center'
                                expiresInDays={3}
                                container={container}
                                expiryDate={'22-11-2025'}
                                minStock={5}
                                currentStock={2}
                            />
                            <StockContainerProductCard
                                name='Salmon'
                                quantity={10}
                                unit='kg'
                                category='Meat'
                                supplier='Elmi Cow Center'
                                expiresInDays={3}
                                container={container}
                                expiryDate={'22-11-2025'}
                                minStock={5}
                                currentStock={2}
                            />
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
