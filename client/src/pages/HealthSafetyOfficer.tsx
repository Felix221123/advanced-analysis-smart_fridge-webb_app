import React from 'react'
import { Panel } from '@/components/Panel'
import { HealthSafetyDashboard } from '@/core/HealthSafetyDashboard'
import { PageContainer } from '@/styles/components/shared.style'

export const HealthSafetyOfficer: React.FC = () => {
    return (
        <>
            <Panel />
            <PageContainer>
                <HealthSafetyDashboard />
            </PageContainer>
        </>
    )
}

