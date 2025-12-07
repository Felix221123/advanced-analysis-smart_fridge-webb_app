import React from 'react'
import LowStock from '@/assets/inventory.svg'
import {
    StockBox,
    TabContainer
} from '@/styles/components/shared.style'
import { SubHeader } from './SubHeader'
import { Paragraph } from './Paragraph'
import ExpiringSoon from '@/assets/simulate_order.svg'

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
                                {container === 'expiringSoon' && <ExpiringSoon />}
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
                </StockBox>

                {/* items in stock */}
                <div className="stocksContainer">
                    <div className="scrollable">
                        {/* array product map listing here */}
                        <p>hello</p>
                    </div>
                </div>
            </TabContainer>
        </>
    )
}


export const ExpiringSoonIcon = () => {
    return <img src={ExpiringSoon} alt="items expiring soon" />
}


export const LowStockItemsIcon = () => {
    return <img src={LowStock} alt="low stocks items" />
}
