import { CountContainer } from '@/components/CountContainer'
import {
    CountContainerBox,
    InventoryContainer,
    TabContainer,
} from '@/styles/components/shared.style'
import React from 'react'
import { SubHeader } from '@/components/SubHeader'
import { Paragraph } from '@/components/Paragraph'
import { AppButton } from '@/components/BaseButton'
import Order from '@/assets/generate_order.svg'
import { ReOrderStockContainerProductCard } from '@/components/ProductCard'




export const Orders: React.FC = () => {
    return (
        <>
            <CountContainerBox>
                <CountContainer
                    heading='Items to Reorder'
                    figures='13'
                />
                <CountContainer
                    heading='Pending Orders'
                    figures='13'
                />
                <CountContainer
                    heading='Sent Orders'
                    figures='13'
                />
            </CountContainerBox>
            <TabContainer>
                <InventoryContainer>
                    <div className="heading">
                        <div className="tabHeader">
                            <SubHeader
                                text='Generate Orders'
                                className='font-bold'
                            />
                            <Paragraph
                                text='Create Orders for items that are below minimum stocks levels'
                            />
                        </div>
                        <AppButton
                            text='Generate Orders'
                            variant='primary'
                            onClick={() => { }}
                            icon={<OrderIcon />}
                        />
                    </div>
                    <Paragraph
                        text='The following items needs to be reordered: '
                    />

                    {/* stocks that needs to be reordered */}
                    <div className="stocksContainer">
                        <div className="scrollable">
                            <ReOrderStockContainerProductCard 
                                name='Salmon'
                                supplier='Fresh Fish'
                                minStock={4}
                                unit='kg'
                                currentStock={2}
                            />
                        </div>
                    </div>
                </InventoryContainer>

            </TabContainer>
        </>
    )
}


export const OrderIcon = () => {
    return (
        <img src={Order} alt="order icon" />
    )
}