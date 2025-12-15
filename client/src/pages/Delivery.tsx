import React, { useState } from 'react'
import { Panel } from '@/components/Panel'
import {
    DeliveryPersonContainer,
    DeliveryPersonOuterContainer,
    DoorAccessController,
    InventoryContainer,
    PageContainer,
    TabContainer
} from '@/styles/components/shared.style'
import { Header } from '@/components/Header'
import { Paragraph } from '@/components/Paragraph'
import { MiniSubHeader, SubHeader } from '@/components/SubHeader'
import { AppButton } from '@/components/BaseButton'
import Package from '@/assets/inventory.svg'
import { ItemModal } from '@/components/ItemModal'
import { BodyOverlay } from '@/styles/components/Loading.style'
import { Input } from '@/components/Input'
import { SearchComp } from '@/shared/Inventory'
import CustomSelect, { ObjectSelectOptions } from '@/components/CustomSelect'
import { roleHeading } from '@/constants/roleHeading'
import { ProductCard } from '@/components/ProductCard'




export const Delivery: React.FC = () => {
    const [doorStatus, setDoorStatus] = useState<boolean>(false);
    const [addItem, setAddItem] = useState<boolean>(false);

    // function to handle the door status on_open
    const handleDoorOpen = () => {
        setDoorStatus(true);
    }
    // function to handle the door status on_close
    const handleDoorClose = () => {
        setDoorStatus(false);
    }



    return (
        <>
            <Panel />
            <PageContainer>
                <DeliveryPersonOuterContainer>
                    <DeliveryPersonContainer>
                        <Header
                            text='Rear Door Access Control'
                            className='font-bold'
                        />
                        <Paragraph
                            text='Control Access to the FFSmart rear door for replenishing inventory'
                            className='font-bold'
                        />
                        {/* door access status */}
                        <DoorAccessController $doorStatus={doorStatus}>
                            <div className="textSectionStatus">
                                <div className="statusBall"></div>
                                <div className="text">
                                    <MiniSubHeader
                                        text='Door Status'
                                    />
                                    <Paragraph
                                        text={
                                            doorStatus ? 'Unlocked' : 'Locked - Secure'
                                        }
                                    />
                                </div>
                            </div>
                            <div className="status">
                                <AppButton
                                    text={doorStatus ? 'OPEN' : 'CLOSED'}
                                    variant='secondary'
                                />
                            </div>
                        </DoorAccessController>

                        <div className="buttonContainer">
                            {
                                doorStatus ? (
                                    <>
                                        <AppButton
                                            text='Complete Delivery and Lock Door'
                                            variant='success'
                                            fullWidth={true}
                                            onClick={() => handleDoorClose()}
                                        />
                                    </>
                                ) : (
                                    <AppButton
                                        text='Unlock Rear Door and Start Delivery'
                                        variant='primary'
                                        fullWidth={true}
                                        onClick={() => handleDoorOpen()}
                                    />
                                )
                            }
                        </div>
                    </DeliveryPersonContainer>

                    <DeliveryPersonContainer>
                        {
                            doorStatus ? (
                                <>
                                    <div className="deliveryTextSection1">
                                        <div className="imageContainer">
                                            <img src={Package} alt="package image" />
                                        </div>
                                        <div className="text">
                                            <MiniSubHeader
                                                text='Active Delivery Section'
                                            />
                                            <Paragraph
                                                text='You can now add items to the fridge. The door will remain unlocked until you complete the delivery'
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="deliveryTextSection2">
                                    <div className="text">
                                        <SubHeader
                                            text='Add Items to Fridge'
                                        />
                                        <Paragraph
                                            text="Record items you're delivering to the restaurant"
                                        />
                                    </div>
                                    <div className="text">
                                        <MiniSubHeader
                                            text='Delivery Session Not Active'
                                            className='font-bold'
                                        />
                                        <Paragraph
                                            text="Please unlock the rear door to start a delivery session before adding items."
                                        />
                                    </div>
                                </div>
                            )
                        }
                    </DeliveryPersonContainer>

                    {
                        doorStatus && (
                            <DeliveryPersonContainer>
                                <SubHeader
                                    text='Add items to Fridge'
                                />
                                <Paragraph
                                    text="Record items you're delivering to the restaurant"
                                />
                                <AppButton
                                    text='+ Add Item'
                                    variant='primary'
                                    onClick={() => { setAddItem(true) }}
                                />
                            </DeliveryPersonContainer>
                        )
                    }
                </DeliveryPersonOuterContainer>

                {/* viewing the items in the fridge */}
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
                                onButton={false}
                            />
                        </div>
                    </div>
                    </InventoryContainer>
                </TabContainer>
            </PageContainer>

            {/* modal containers */}
            {addItem && (
                <ItemModal
                    title='Add Item to Fridge'
                    description='Enter the details of the item you are adding to the fridge'
                    onClose={() => setAddItem(false)}
                    newItem={true}
                />
            )}
            {addItem && <BodyOverlay />}
        </>
    )
}

