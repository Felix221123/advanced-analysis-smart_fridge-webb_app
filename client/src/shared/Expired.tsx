import React, { useEffect, useMemo, useCallback, useState } from 'react'
import { StockContainer } from '@/components/StockContainer'
import { AllProducts } from '@/packages/api/ServicesApi';
import { AllFoodItemProps } from '@/interface/ComponentProps';
import { useAuth } from '@/context/useAuth';
import { isExpired } from '@/utils/stockFilters';

export const Expired: React.FC = () => {
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


    const expiredItems = useMemo(
        () => products.filter(isExpired),
        [products]
    );


    return (
        <>
            <StockContainer
                container="expired"
                title="Expired Items - Immediate Action Required"
                description={`${expiredItems.length} item(s) are past expiry date`}
                items={expiredItems}
                loading={loading}
                error={error}
                emptyText="No expired items."
            />
        </>
    )
}

