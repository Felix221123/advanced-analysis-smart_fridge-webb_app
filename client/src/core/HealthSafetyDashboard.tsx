import React, { useState, useCallback, useMemo, useEffect } from 'react'
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
import { useAuth } from '@/context/useAuth'
import { AllFoodItemProps } from '@/interface/ComponentProps'
import { AllProducts } from '@/packages/api/ServicesApi';
import { isCompliant, isExpiringSoon } from '@/utils/stockFilters'

const EXPIRING_SOON_DAYS = 7;

export const HealthSafetyDashboard: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<AllFoodItemProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const restaurantId = user?.restaurant_id ? String(user.restaurant_id) : "";

    const fetchProducts = useCallback(async () => {
        if (!restaurantId) return;
        setLoading(true);
        setError(null);

        try {
            const res = await AllProducts();
            const filtered = Array.isArray(res)
                ? res.filter((p: AllFoodItemProps) => String(p.restaurant_id) === restaurantId)
                : [];
            setProducts(filtered);
        } catch (err: any) {
            setError(err?.message || err?.detail || "Could not load products.");
        } finally {
            setLoading(false);
        }
    }, [restaurantId]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const compliantItems = useMemo(
        () => products.filter((p) => isCompliant(p, EXPIRING_SOON_DAYS)),
        [products]
    );

    console.log(loading, ' is the loading state')
    console.log(error, ' is the loading state')

    // Helper function to determine if an item is expired
    const isExpired = (item: AllFoodItemProps) => {
        if (!item.expiry_date) return false;
        const expiry = new Date(item.expiry_date);
        const now = new Date();
        // Compare dates (item is expired if expiry date is before today)
        return expiry < now;
    };

    const expiredItems = useMemo(
        () => products.filter(isExpired),
        [products]
    );

    const expiringSoonItems = useMemo(
        () => products.filter((p) => isExpiringSoon(p, EXPIRING_SOON_DAYS)),
        [products]
    );

    const itemsWithExpiry = useMemo(
        () => products.filter((p) => p.expiry_date), // only count items that actually have a date
        [products]
    );


    const complianceScore = useMemo(() => {
        const total = itemsWithExpiry.length;
        if (total === 0) return 100;
        const ok = compliantItems.length;
        return Math.round((ok / total) * 100);
    }, [compliantItems.length, itemsWithExpiry.length]);

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
                    figures={`${complianceScore}%`}
                    description='Overall food Safety'
                />
                <CountContainer
                    heading='Compliance Items'
                    figures={String(compliantItems.length)}
                    description='Within safe dates'
                />
                <CountContainer
                    heading='Expiring soon'
                    figures={String(expiringSoonItems.length)}
                    description='Within 7 days '
                />
                <CountContainer
                    heading='Expired Items'
                    figures={String(expiredItems.length)}
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

