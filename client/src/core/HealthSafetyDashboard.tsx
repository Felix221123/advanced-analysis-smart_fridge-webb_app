import React, { useState } from 'react'
import {
    NavigationTab,
    NavItem
} from '@/styles/components/Dashboard.style'
import { Overview } from '@/shared/Overview'
import { ComplianceItems } from '@/shared/ComplianceItems'
import { ExpiringSoon } from '@/shared/ExpiringSoon'


export const HealthSafetyDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("OVERVIEW")

    // navigation tab
    const navList = [
        { key: "OVERVIEW", label: "Overview" },
        { key: "COMPLIANCE", label: "Compliance Items" },
        { key: "EXPIRINGSOON", label: "Expiring Soon" },
    ]


    return (
        <>
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
        </>
    )
}

