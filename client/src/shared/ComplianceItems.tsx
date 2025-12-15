import React from 'react'
import { StockContainer } from '@/components/StockContainer'




export const ComplianceItems: React.FC = () => {
    return (
        <>
            <StockContainer
                container='complianceItems'
                title='Compliant Items'
                description='Item(s) that meet food safety standards'
            />
        </>
    )
}

