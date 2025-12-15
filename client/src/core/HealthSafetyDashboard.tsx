import React, { useState } from 'react'
import {
    NavigationTab,
    NavItem
} from '@/styles/components/Dashboard.style'
import { Overview } from '@/shared/Overview'
import { ComplianceItems } from '@/shared/ComplianceItems'
import { ExpiringSoon } from '@/shared/ExpiringSoon'
import { CountContainerBox } from '@/styles/components/shared.style'
import { CountContainer } from '@/components/CountContainer'
import { Expired } from '@/shared/Expired'






export const HealthSafetyDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("OVERVIEW")

    // navigation tab
    const navList = [
        { key: "OVERVIEW", label: "Overview" },
        { key: "EXPIRED", label: "Expired Items" },
        { key: "EXPIRINGSOON", label: "Expiring Soon" },
        { key: "COMPLIANCE", label: "Compliance Items" },
    ]


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
            <NavigationTab>
                {navList.map((item) => (
                    <NavItem
                        key={item.key}
                        className={activeTab === item.key ? "active" : ""}
                        onClick={() => setActiveTab(item.key)}
                    >
                        <span>{item.label}</span>
                    </NavItem>
                ))}
            </NavigationTab>

            {activeTab === "OVERVIEW" && <Overview />}
            {activeTab === "COMPLIANCE" && <ComplianceItems />}
            {activeTab === "EXPIRINGSOON" && <ExpiringSoon />}
            {activeTab === "EXPIRED" && <Expired />}
        </>
    )
}

