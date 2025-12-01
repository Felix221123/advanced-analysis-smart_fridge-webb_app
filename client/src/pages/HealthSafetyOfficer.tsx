import React from 'react'
import { Panel } from '@/components/Panel'
import { HealthSafetyDashboard } from '@/core/HealthSafetyDashboard'

export const HealthSafetyOfficer: React.FC = () => {
    return (
        <>
            <Panel />
            <HealthSafetyDashboard />
        </>
    )
}

