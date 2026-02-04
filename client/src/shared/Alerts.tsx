import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CountContainer } from "@/components/CountContainer";
import { CountContainerBox } from "@/styles/components/shared.style";
import { StockContainer } from "@/components/StockContainer";
import { useAuth } from "@/context/useAuth";
import { AllProducts } from "@/packages/api/ServicesApi";
import { AllFoodItemProps } from "@/interface/ComponentProps";
import { isExpiringSoon, isLowStock } from "@/utils/stockFilters";

const EXPIRING_SOON_DAYS = 3;


export const Alerts: React.FC = () => {
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

  const expiringSoonItems = useMemo(
    () => products.filter((p) => isExpiringSoon(p, EXPIRING_SOON_DAYS)),
    [products]
  );

  const lowStockItems = useMemo(
    () => products.filter(isLowStock),
    [products]
  );


  return (
    <>
      <CountContainerBox>
      <CountContainer
          heading="Expiring Soon"
          figures={String(expiringSoonItems.length)}
          description={`Within ${EXPIRING_SOON_DAYS} days`}
        />
        <CountContainer
          heading="Low Stock"
          figures={String(lowStockItems.length)}
          description="At/under reorder point"
        />
      </CountContainerBox>

      <StockContainer
        container="expiringSoon"
        title="Items Expiring Soon"
        description={`${expiringSoonItems.length} item(s) will expire within ${EXPIRING_SOON_DAYS} days`}
        items={expiringSoonItems}
        loading={loading}
        error={error}
        emptyText="No items expiring soon."
      />

      <StockContainer
        container="lowStockItems"
        title="Low Stock Items"
        description={`${lowStockItems.length} item(s) are running low and need reordering`}
        items={lowStockItems}
        loading={loading}
        error={error}
        emptyText="No low stock items."
      />
    </>
  )
}

