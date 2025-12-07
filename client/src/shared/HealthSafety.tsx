import { CountContainer } from '@/components/CountContainer'
import { CountContainerBox, TabContainer } from '@/styles/components/shared.style'
import React from 'react'






export const HealthSafety: React.FC = () => {


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
      <TabContainer></TabContainer>
    </>
  )
}

