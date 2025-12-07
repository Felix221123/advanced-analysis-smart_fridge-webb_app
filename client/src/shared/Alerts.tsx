import React from 'react'
import { CountContainer } from '@/components/CountContainer'
import { CountContainerBox } from '@/styles/components/shared.style'
import { StockContainer } from '@/components/StockContainer'


export const Alerts: React.FC = () => {
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

      <StockContainer
        container='expiringSoon'
        title='Low Stock Items'
        description='2 Item(s) are running low and needs to be reordered'
      />
    </>
  )
}

