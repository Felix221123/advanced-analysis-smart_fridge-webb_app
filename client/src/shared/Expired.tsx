import React from 'react'
import { StockContainer } from '@/components/StockContainer'




export const Expired: React.FC = () => {
    return (
        <>
            <StockContainer
                container='expired'
                title='Expired Items - Immediate Action Required'
                description='These items must be removed from the fridge immediately'
            />
        </>
    )
}

