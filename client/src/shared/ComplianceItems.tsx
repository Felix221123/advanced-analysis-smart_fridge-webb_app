import React, { useEffect, useMemo, useCallback, useState } from 'react'
import { StockContainer } from '@/components/StockContainer'
import { isCompliant } from '@/utils/stockFilters';
import { AllProducts } from '@/packages/api/ServicesApi';
import { AllFoodItemProps } from '@/interface/ComponentProps';
import { useAuth } from '@/context/useAuth';

const EXPIRING_SOON_DAYS = 7;



export const ComplianceItems: React.FC = () => {

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






    return (
        <>
            <StockContainer
                container="complianceItems"
                title="Compliant Items"
                description={`${compliantItems.length} item(s) meet food safety standards`}
                items={compliantItems}
                loading={loading}
                error={error}
                emptyText="No compliant items found."
            />
        </>
    )
}

