import React, { useState, useCallback, useEffect, useMemo } from "react";
import { CountContainer } from "@/components/CountContainer";
import { CountContainerBox, InventoryContainer, TabContainer } from "@/styles/components/shared.style";
import { SubHeader } from "@/components/SubHeader";
import { Paragraph } from "@/components/Paragraph";
import { AppButton } from "@/components/BaseButton";
import Order from "@/assets/generate_order.svg";
import { ReOrderStockContainerProductCard } from "@/components/ProductCard";
import { GenerateOrdersForLowStock, ListSupplyOrders, MarkSupplyOrderSent } from "@/packages/api/OrderApi";
import { useAuth } from "@/context/useAuth";
import { MessageSuccess } from "@/components/MessageModal";
import { BodyOverlay } from "@/styles/components/Loading.style";
import { AllFoodItemProps } from "@/interface/ComponentProps";
import { AllProducts } from "@/packages/api/ServicesApi";
import { SupplyOrderReadProps } from "@/interface/ApiProps";
import { MiniSubHeader } from "@/components/SubHeader";

export const Orders: React.FC = () => {
    const { user } = useAuth();

    const [products, setProducts] = useState<AllFoodItemProps[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [loadingGenerate, setLoadingGenerate] = useState(false);

    // toast that lasts 8500ms
    const [successMsg, setSuccessMsg] = useState<{ title: string; description: string } | null>(null);
    const [successTimer, setSuccessTimer] = useState<number | null>(null);

    const [pendingOrders, setPendingOrders] = useState<SupplyOrderReadProps[]>([]);
    const [sentOrders, setSentOrders] = useState<SupplyOrderReadProps[]>([]);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [openOrders, setOpenOrders] = useState<SupplyOrderReadProps[]>([]);

    const restaurantId = user?.restaurant_id ? String(user.restaurant_id) : "";

    const showSuccess = (title: string, description: string) => {
        if (successTimer) window.clearTimeout(successTimer);
        setSuccessMsg({ title, description });
        const t = window.setTimeout(() => setSuccessMsg(null), 8500);
        setSuccessTimer(t);
    };

    const fetchProducts = useCallback(async () => {
        if (!restaurantId) return;

        setLoadingProducts(true);
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
            setLoadingProducts(false);
        }
    }, [restaurantId]);

    const refreshOrders = useCallback(async () => {
        if (!user?.id) return;

        const open = await ListSupplyOrders({
            user_id: String(user.id),
            status: ["PENDING", "SENT", "PARTIALLY_DELIVERED"],
        });

        setOpenOrders(open);
        setPendingOrders(open.filter(o => String(o.status) === "PENDING"));
        setSentOrders(open.filter(o => String(o.status) === "SENT"));
    }, [user?.id]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        refreshOrders().catch(() => { });
    }, [refreshOrders]);

    const lowStockItems = useMemo(() => {
        return products.filter((p) => {
            const min = Number(p.reorder_point ?? 0);
            const qty = Number(p.qty_total ?? 0);
            return min > 0 && qty <= min;
        });
    }, [products]);

    const handleGenerateOrders = async () => {
        if (!user?.id) return;

        setLoadingGenerate(true);
        setError(null);

        try {
            const response = await GenerateOrdersForLowStock({
                user_id: String(user.id),
                notes: "Generating orders for low stock",
            });

            const created = response?.created_orders?.length ?? 0;
            const skipped = response?.skipped_items_missing_supplier?.length ?? 0;

            if (skipped > 0) {
                showSuccess(
                    "No orders created",
                    `${skipped} item(s) were skipped because they have no supplier set.`
                );
            } else {
                showSuccess(
                    "Orders generated",
                    `${created} order(s) created.${skipped ? ` ${skipped} item(s) skipped (missing supplier).` : ""}`
                );
            }

            await refreshOrders();
        } catch (e: any) {
            setError(e?.detail || e?.message || "Could not generate orders.");
        } finally {
            setLoadingGenerate(false);
        }
    };

    const handleMarkAsSent = async (orderId: string) => {
        if (!user?.id) return;

        setSendingId(orderId);
        setError(null);

        try {
            await MarkSupplyOrderSent({
                user_id: String(user.id),
                supply_order_id: orderId,
            });

            showSuccess("Order sent", "Order status updated to SENT.");
            await refreshOrders();
        } catch (e: any) {
            setError(e?.detail || e?.message || "Could not mark order as sent.");
        } finally {
            setSendingId(null);
        }
    };

    type OnOrderInfo = {
        status: string;
        supplier_name?: string | null;
        order_id: string;
        qty_requested: number;
        qty_delivered: number;
        created_at: string;
    };

    const onOrderByFoodItemId = useMemo(() => {
        const rank = (s: string) =>
            s === "SENT" ? 3 : s === "PARTIALLY_DELIVERED" ? 2 : s === "PENDING" ? 1 : 0;

        const map: Record<string, OnOrderInfo> = {};

        for (const o of openOrders) {
            const oStatus = String(o.status);
            const oCreated = String(o.created_at);

            for (const li of o.items ?? []) {
                const key = String(li.food_item_id);

                const cand: OnOrderInfo = {
                    status: oStatus,
                    supplier_name: o.supplier_name,
                    order_id: String(o.id),
                    qty_requested: Number(li.qty_requested ?? 0),
                    qty_delivered: Number(li.qty_delivered ?? 0),
                    created_at: oCreated,
                };

                const prev = map[key];
                if (
                    !prev ||
                    rank(cand.status) > rank(prev.status) ||
                    (rank(cand.status) === rank(prev.status) &&
                        new Date(cand.created_at).getTime() > new Date(prev.created_at).getTime())
                ) {
                    map[key] = cand;
                }
            }
        }

        return map;
    }, [openOrders]);


    const lowStockNotOrdered = useMemo(() => {
        return lowStockItems.filter(p => !onOrderByFoodItemId[String(p.id)]);
    }, [lowStockItems, onOrderByFoodItemId]);

    const itemsToReorderCount = lowStockNotOrdered.length;




    return (
        <>
            <CountContainerBox>
                <CountContainer heading="Items to Reorder" figures={String(itemsToReorderCount)} />
                <CountContainer heading="Pending Orders" figures={String(pendingOrders.length)} />
                <CountContainer heading="Sent Orders" figures={String(sentOrders.length)} />
            </CountContainerBox>

            <TabContainer>
                <InventoryContainer>
                    {/* Pending Orders list with "Mark as Sent" */}
                    <div style={{ marginTop: 18 }}>
                        <SubHeader text="Pending Orders" className="font-bold" />
                        {pendingOrders.length === 0 ? (
                            <Paragraph text="No pending orders yet." />
                        ) : (
                            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                                {pendingOrders.map((o) => (
                                    <div
                                        key={o.id}
                                        style={{
                                            border: "1px solid #eee",
                                            borderRadius: 12,
                                            padding: 12,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: 12,
                                        }}
                                    >
                                        <div>
                                            <MiniSubHeader text={`${o.supplier_name ?? "Supplier"} • ${o.status}`} />
                                            <Paragraph text={`Items: ${o.items?.length ?? 0}`} />
                                        </div>
                                        <AppButton
                                            text={sendingId === String(o.id) ? "Sending..." : "Mark as Sent"}
                                            variant="secondary"
                                            onClick={() => handleMarkAsSent(String(o.id))}
                                            disabled={sendingId === String(o.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </InventoryContainer>
            </TabContainer>

            <TabContainer>
                <InventoryContainer>
                    <div className="heading">
                        <div className="tabHeader">
                            <SubHeader text="Generate Orders" className="font-bold" />
                            <Paragraph text="Create Orders for items that are below minimum stocks levels" />
                        </div>

                        <AppButton
                            text={loadingGenerate ? "Generating..." : "Generate Orders"}
                            variant="primary"
                            onClick={handleGenerateOrders}
                            icon={<img src={Order} alt="order icon" />}
                            disabled={loadingGenerate || itemsToReorderCount === 0}
                        />
                    </div>

                    {error && <p className="text-sm" style={{ color: "red" }}>{error}</p>}

                    <Paragraph text="The following items needs to be reordered:" />


                    <div className="stocksContainer">
                        <div className="scrollable">
                            {loadingProducts && <p className="text-sm">Loading items...</p>}
                            {!loadingProducts && lowStockItems.length === 0 && (
                                <p className="text-sm">No items are currently below minimum stock.</p>
                            )}

                            {lowStockItems.map((p) => {
                                const onOrder = onOrderByFoodItemId[String(p.id)];

                                return (
                                    <ReOrderStockContainerProductCard
                                        key={p.id}
                                        name={p.name}
                                        supplier={p.supplier_name ?? "—"}
                                        unit={p.unit}
                                        currentStock={Number(p.qty_total ?? 0)}
                                        minStock={Number(p.reorder_point ?? 0)}
                                        // ✅ new props
                                        ordered={!!onOrder}
                                        orderStatus={onOrder?.status}
                                        orderedFrom={onOrder?.supplier_name ?? undefined}
                                        qtyRequested={onOrder?.qty_requested}
                                        qtyDelivered={onOrder?.qty_delivered}
                                    />
                                );
                            })}

                        </div>
                    </div>


                </InventoryContainer>
            </TabContainer>

            {/* loading overlay only while generating */}
            {loadingGenerate && (
                <>
                    <MessageSuccess title="Generating Orders" description="Generating orders..." />
                    <BodyOverlay />
                </>
            )}

            {/* success toast stays 8500ms */}
            {successMsg && (
                <>
                    <MessageSuccess title={successMsg.title} description={successMsg.description} />
                    <BodyOverlay />
                </>
            )}
        </>
    );
};



export const OrderIcon = () => {
    return (
        <img src={Order} alt="order icon" />
    )
}