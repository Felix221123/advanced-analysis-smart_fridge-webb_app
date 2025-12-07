import React from 'react'
import { Panel } from '@/components/Panel'
import { HeadChefDashboard } from '@/core/HeadChefDashboard'
import { PageContainer } from '@/styles/components/shared.style'



export const HeadChef: React.FC = () => {

    return (
        <>
            <Panel />
            <PageContainer>
                <HeadChefDashboard />
            </PageContainer>
        </>
    )
}

