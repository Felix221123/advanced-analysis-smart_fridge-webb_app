import React, { useState } from 'react'
import {
    NavigationTab,
    NavBadge,
    NavItem
} from '@/styles/components/Dashboard.style'
import { Inventory } from '@/shared/Inventory'
import { Alerts } from '@/shared/Alerts'
import { Orders } from '@/shared/Orders'
import { UserManagement } from '@/shared/UserManagement'
import { HealthSafety } from '@/shared/HealthSafety'
import INVENTORY_ICON from '@/assets/inventory.svg'
import ALERT_ICON from '@/assets/alert.svg'
import ORDER_ICON from '@/assets/orders.svg'
import USER_ICON from '@/assets/user_management.svg'
import SAFETY_ICON from '@/assets/doc_health_safety.svg'





export const HeadChefDashboard: React.FC = () => {

    const [activeTab, setActiveTab] = useState<string>("INVENTORY")

    const navList = [
        { key: "INVENTORY", label: "Inventory", icon: INVENTORY_ICON },
        { key: "ALERTS", label: "Alerts", icon: ALERT_ICON, badge: 7 },
        { key: "ORDERS", label: "Orders", icon: ORDER_ICON },
        { key: "USER_MANAGEMENT", label: "User Management", icon: USER_ICON },
        { key: "HEALTH_SAFETY", label: "Health & Safety", icon: SAFETY_ICON },
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
                        <img src={item.icon} alt={`${item.label} icon`} />

                        <span>{item.label}</span>

                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                    </NavItem>
                ))}
            </NavigationTab>

            {/* ---- PAGE CONTENT BELOW ---- */}
            {activeTab === "INVENTORY" && <Inventory />}
            {activeTab === "ALERTS" && <Alerts />}
            {activeTab === "ORDERS" && <Orders />}
            {activeTab === "USER_MANAGEMENT" && <UserManagement />}
            {activeTab === "HEALTH_SAFETY" && <HealthSafety />}
        </>
    )
}

