import React, { useState } from 'react'
import {
    CountContainerBox,
    InventoryContainer,
    TabContainer
} from '@/styles/components/shared.style'
import { SubHeader } from '@/components/SubHeader'
import { Paragraph } from '@/components/Paragraph'
import { AppButton } from '@/components/BaseButton'
import { ItemModal } from '@/components/ItemModal'
import { BodyOverlay } from '@/styles/components/Loading.style'
import { Input } from '@/components/Input'
import SearchIcon from '@/assets/search_icon.svg'
import CustomSelect, { ObjectSelectOptions } from '@/components/CustomSelect'
import { roleHeading } from '@/constants/roleHeading'
import { ProductCard } from '@/components/ProductCard'
import { CountContainer } from '@/components/CountContainer'
import { DeleteModal } from '@/components/DeleteModal'


export const Inventory: React.FC = () => {
    const [addItem, setAddItem] = useState<boolean>(false);
    const [removeItem, setRemoveItem] = useState<boolean>(false);
    // const [searchQuery, setSearchQuery] = useState<string>('')


    return (
        <>
            <CountContainerBox>
                <CountContainer
                    heading='Total Items'
                    figures='13'
                    description='he is here'
                />
                <CountContainer
                    heading='Total Items'
                    figures='13'
                    description='he is here'
                />
            </CountContainerBox>
            <TabContainer>
                <InventoryContainer>
                    {/* heading of the inventory dashboard */}
                    <div className="heading">
                        <div className="tabHeader">
                            <SubHeader
                                text='Fridge Inventory'
                                className='font-bold'
                            />
                            <Paragraph
                                text='Items in Stock'
                            />
                        </div>
                        <AppButton
                            text='+  Add Item'
                            variant='primary'
                            onClick={() => { setAddItem(true) }}
                        />
                    </div>

                    {/* search functionality */}
                    <div className="itemSearch">
                        <Input
                            type='search'
                            placeholder='Search Items...'
                            icon={<SearchComp />}
                        />
                        <CustomSelect >
                            <option value="">All Categories</option>
                            <ObjectSelectOptions data={roleHeading} />
                        </CustomSelect>
                    </div>

                    {/* items in stock */}
                    <div className="stocksContainer">
                        <div className="scrollable">
                            {/* array product map listing here */}
                            <ProductCard
                                name='Salmon'
                                quantity={10}
                                unit='kg'
                                category='Meat'
                                supplier='Elmi Cow Center'
                                minStock={2}
                                addedBy='Felix Baah'
                                addedAt='2025-11-22'
                                runningLow={true}
                                expiresInDays={3}
                                onEdit={() => {}}
                                onRemove={() => setRemoveItem(true)}
                                onButton={true}
                            />
                        </div>
                    </div>
                </InventoryContainer>
            </TabContainer>


            {/* modal containers */}
            {addItem && (
                <ItemModal
                    title='Add Item to Fridge'
                    description='Enter the details of the item you are adding to the fridge'
                    onClose={() => setAddItem(false)}
                    newItem={true}
                />
            )}
            {removeItem && (
                <DeleteModal
                    container='item'
                    onClose={() => setRemoveItem(false)}
                />
            )}
            {addItem && <BodyOverlay />}
            {removeItem && <BodyOverlay />}
        </>
    )
}






export const SearchComp: React.FC = () => {
    return (
        <>
            <img src={SearchIcon} alt="search icon" />
        </>
    )
}