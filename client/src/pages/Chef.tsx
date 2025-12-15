import { Panel } from '@/components/Panel'
import { Inventory } from '@/shared/Inventory'
import { PageContainer } from '@/styles/components/shared.style'
import React from 'react'

export const Chef: React.FC = () => {
    return (
        <>
            <Panel />
            <PageContainer>
                <Inventory />
            </PageContainer>
        </>
    )
}

