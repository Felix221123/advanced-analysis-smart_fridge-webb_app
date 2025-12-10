import React from 'react'
import { CountContainer } from '@/components/CountContainer'
import { CountContainerBox, StockBox, TabContainer } from '@/styles/components/shared.style'
import { SubHeader } from '@/components/SubHeader'
import { Paragraph } from '@/components/Paragraph'



export const HealthSafety: React.FC = () => {


  return (
    <>
      <CountContainerBox>
        <CountContainer
          heading='Compliance Score'
          figures='13'
          description='Overall food Safety'
        />
        <CountContainer
          heading='Compliance Items'
          figures='13'
          description='Within safe dates'
        />
        <CountContainer
          heading='Expiring soon'
          figures='13'
          description='Within 7 days '
        />
        <CountContainer
          heading='Expired Items'
          figures='13'
          description='Past expiry date'
        />
      </CountContainerBox>
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
          
        </StockBox>
      </TabContainer>
    </>
  )
}

