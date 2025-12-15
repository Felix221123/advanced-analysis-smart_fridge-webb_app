import { StockContainer } from '@/components/StockContainer'
import React from 'react'

export const ExpiringSoon: React.FC = () => {
    return (
        <>
            <StockContainer
                container='expiringSoon'
                title=' Items Expiring Soon'
                description='2 Item(s) will expire within 3 days'
            />
        </>
    )
}

