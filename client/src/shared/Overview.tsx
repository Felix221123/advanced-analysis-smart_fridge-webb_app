import React from 'react'
import { CountContainer } from '@/components/CountContainer'
import { 
    TabContainer,
    StockBox,
} from '@/styles/components/shared.style'
import { SubHeader } from '@/components/SubHeader'
import { Paragraph } from '@/components/Paragraph'
import { AppButton } from '@/components/BaseButton'
import { DownloadIcon } from './HealthSafety'







export const Overview: React.FC = () => {
    
    return (
        <>
            <TabContainer>
                <StockBox>
                    <div className="heading">
                        <div className="tabHeader">
                            <div className="headerIcon">
                                <SubHeader
                                    text='Food Safety Overview'
                                    className='font-bold'
                                />
                            </div>
                            <Paragraph
                                text='Current Status of all items in the fridge'
                            />
                        </div>
                    </div>

                    {/* item header in containers */}
                    <div className="itemsContainer">
                        <CountContainer
                            heading='Safe to Use'
                            figures='1'
                            container='green'
                            description='Items in good condition'
                        />
                        <CountContainer
                            heading='Use Soon'
                            figures='3'
                            container='yellow'
                            description='Expiring within 7 days'
                        />
                        <CountContainer
                            heading='Remove'
                            figures='0'
                            container='red'
                            description='Past expiry date'
                        />
                    </div>
                    <div className="buttonContainer">
                        <AppButton
                            text='Download Food Safety Report'
                            fullWidth={true}
                            icon={<DownloadIcon />}
                        />
                        <AppButton
                            text='Download Inventory Report'
                            fullWidth={true}
                            variant='outline'
                        />
                    </div>

                </StockBox>
            </TabContainer>
        </>
    )
}

