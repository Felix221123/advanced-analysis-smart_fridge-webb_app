import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Panel } from '@/components/Panel'
import {
    DeliveryPersonContainer,
    DeliveryPersonOuterContainer,
    DoorAccessController,
    InventoryContainer,
    PageContainer,
    TabContainer
} from '@/styles/components/shared.style'
import { Header } from '@/components/Header'
import { Paragraph } from '@/components/Paragraph'
import { MiniSubHeader, SubHeader } from '@/components/SubHeader'
import { AppButton } from '@/components/BaseButton'
import Package from '@/assets/inventory.svg'
import { ItemModal } from '@/components/ItemModal'
import { BodyOverlay } from '@/styles/components/Loading.style'
import { Input } from '@/components/Input'
import { SearchComp } from '@/shared/Inventory'
import { ProductCard } from '@/components/ProductCard'
import { useAuth } from '@/context/useAuth'
import { AllFoodItemProps } from '@/interface/ComponentProps'
import { PRODUCTS_KEY_PREFIX, readCache, writeCache, pickLatestMovement, } from '@/shared/Inventory'
import { AllProducts } from '@/packages/api/ServicesApi'
import { MessageSuccess } from '@/components/MessageModal'
import { daysUntil } from '@/utils/date'
import { DoorAccess, GetRearDoorStatus, ListSupplyOrders } from '@/packages/api/OrderApi'
import { SupplyOrderReadProps } from '@/interface/ApiProps'
import { ReceiveOrderModal } from "@/components/ReceiveOrderModal";


export const Delivery: React.FC = () => {
    const { user } = useAuth();
    const [doorStatus, setDoorStatus] = useState<boolean>(false);
    const [addItem, setAddItem] = useState<boolean>(false);
    const [products, setProducts] = useState<AllFoodItemProps[]>([]);
    const [successMsg, setSuccessMsg] = useState<{ title: string; description: string } | null>(null);
    const [successTimer, setSuccessTimer] = useState<number | null>(null);
    const [selectedIdToEdit, setSelectedIdToEdit] = useState("");
    const [editItem, setEditItem] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchInput, setSearchInput] = useState("");

    const restaurantId = user?.restaurant_id ? String(user.restaurant_id) : "";


    const cacheKey = useMemo(
        () => (restaurantId ? `${PRODUCTS_KEY_PREFIX}_${restaurantId}` : PRODUCTS_KEY_PREFIX),
        [restaurantId]
    );

    const fetchProducts = useCallback(async () => {
        if (!restaurantId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await AllProducts();

            // / filter by user's restaurant
            const filtered = Array.isArray(res)
                ? res.filter((p: AllFoodItemProps) => String(p.restaurant_id) === restaurantId)
                : [];

            setProducts(filtered);
            writeCache(cacheKey, filtered);
            writeCache(cacheKey, filtered);
        } catch (err: any) {
            setError(err?.message || err?.detail || "Could not load products.");
        } finally {
            setLoading(false);
        }
    }, [restaurantId, cacheKey]);

    useEffect(() => {
        if (!restaurantId) return;

        // cache-first
        const cached = readCache(cacheKey).filter((p) => String(p.restaurant_id) === restaurantId);
        if (cached.length) setProducts(cached);

        fetchProducts();
    }, [restaurantId, cacheKey, fetchProducts]);

    const showSuccess = (title: string, description: string) => {
        if (successTimer) window.clearTimeout(successTimer);
        setSuccessMsg({ title, description });
        const t = window.setTimeout(() => setSuccessMsg(null), 8500);
        setSuccessTimer(t);
    };

    const selectedProductToEdit = useMemo(() => {
        return products.find((p) => String(p.id) === String(selectedIdToEdit)) ?? null;
    }, [products, selectedIdToEdit]);


    //handling search results
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setSearchQuery(searchInput.trim());
        }
    };

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const visibleProducts = useMemo(() => {
        if (!normalizedQuery) return products;
        return products.filter((item) =>
            (item.name ?? "").toLowerCase().includes(normalizedQuery)
        );
    }, [products, normalizedQuery]);


    const noResults = normalizedQuery.length > 0 && visibleProducts.length === 0;

    const refreshDoor = useCallback(async () => {
        if (!user?.id) return;
        const s = await GetRearDoorStatus(String(user.id));
        setDoorStatus(!s.is_locked);
    }, [user?.id]);

    useEffect(() => {
        refreshDoor().catch(() => { });
    }, [refreshDoor]);

    const handleDoorOpen = async () => {
        if (!user?.id) return;
        const r = await DoorAccess({
            user_id: String(user.id),
            door_type: "REAR",
            set_locked: false,
            reason: "Start delivery",
        });
        setDoorStatus(!r.door.is_locked);
    };

    const handleDoorClose = async () => {
        if (!user?.id) return;
        const r = await DoorAccess({
            user_id: String(user.id),
            door_type: "REAR",
            set_locked: true,
            reason: "Complete delivery",
        });
        setDoorStatus(!r.door.is_locked);
    };

    const [orders, setOrders] = useState<SupplyOrderReadProps[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<SupplyOrderReadProps | null>(null);
    const [receiveOpen, setReceiveOpen] = useState(false);

    const fetchOrders = useCallback(async () => {
        if (!user?.id) return;
        const res = await ListSupplyOrders({
            user_id: String(user.id),
            status: ["SENT", "PARTIALLY_DELIVERED"],
        });
        setOrders(res);
    }, [user?.id]);

    useEffect(() => {
        fetchOrders().catch(() => { });
    }, [fetchOrders]);





    return (
        <>
            <Panel />
            <PageContainer>
                <DeliveryPersonOuterContainer>
                    <DeliveryPersonContainer>
                        <Header
                            text='Rear Door Access Control'
                            className='font-bold'
                        />
                        <Paragraph
                            text='Control Access to the FFSmart rear door for replenishing inventory'
                            className='font-bold'
                        />
                        {/* door access status */}
                        <DoorAccessController $doorStatus={doorStatus}>
                            <div className="textSectionStatus">
                                <div className="statusBall"></div>
                                <div className="text">
                                    <MiniSubHeader
                                        text='Door Status'
                                    />
                                    <Paragraph
                                        text={
                                            doorStatus ? 'Unlocked' : 'Locked - Secure'
                                        }
                                    />
                                </div>
                            </div>
                            <div className="status">
                                <AppButton
                                    text={doorStatus ? 'OPEN' : 'CLOSED'}
                                    variant='secondary'
                                />
                            </div>
                        </DoorAccessController>

                        <div className="buttonContainer">
                            {
                                doorStatus ? (
                                    <>
                                        <AppButton
                                            text='Complete Delivery and Lock Door'
                                            variant='success'
                                            fullWidth={true}
                                            onClick={() => handleDoorClose()}
                                        />
                                    </>
                                ) : (
                                    <AppButton
                                        text='Unlock Rear Door and Start Delivery'
                                        variant='primary'
                                        fullWidth={true}
                                        onClick={() => handleDoorOpen()}
                                    />
                                )
                            }
                        </div>
                    </DeliveryPersonContainer>

                    <DeliveryPersonContainer>
                        {
                            doorStatus ? (
                                <>
                                    <div className="deliveryTextSection1">
                                        <div className="imageContainer">
                                            <img src={Package} alt="package image" />
                                        </div>
                                        <div className="text">
                                            <MiniSubHeader
                                                text='Active Delivery Section'
                                            />
                                            <Paragraph
                                                text='You can now add items to the fridge. The door will remain unlocked until you complete the delivery'
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="deliveryTextSection2">
                                    <div className="text">
                                        <SubHeader
                                            text='Add Items to Fridge'
                                        />
                                        <Paragraph
                                            text="Record items you're delivering to the restaurant"
                                        />
                                    </div>
                                    <div className="text">
                                        <MiniSubHeader
                                            text='Delivery Session Not Active'
                                            className='font-bold'
                                        />
                                        <Paragraph
                                            text="Please unlock the rear door to start a delivery session before adding items."
                                        />
                                    </div>
                                </div>
                            )
                        }
                    </DeliveryPersonContainer>

                    {
                        doorStatus && (
                            <DeliveryPersonContainer>
                                <SubHeader
                                    text='Record items to Fridge'
                                />
                                <Paragraph
                                    text="Record items you're delivering to the restaurant"
                                />
                                <AppButton
                                    text='+ Add Item'
                                    variant='primary'
                                    onClick={() => { setAddItem(true) }}
                                />
                            </DeliveryPersonContainer>
                        )
                    }
                </DeliveryPersonOuterContainer>

                {doorStatus && (
                    <DeliveryPersonContainer>
                        <SubHeader text="Incoming Orders" />
                        <Paragraph text="Select an order and record what you delivered (batch + expiry)." />

                        {orders.length === 0 ? (
                            <Paragraph text="No incoming orders marked as SENT yet." />
                        ) : (
                            <div className="ordersList">
                                {orders.map((o) => (
                                    <div key={o.id} className="orderCard">
                                        <MiniSubHeader text={`${o.supplier_name ?? "Supplier"} • ${o.status}`} />
                                        <Paragraph text={`Items: ${o.items?.length ?? 0}`} />

                                        <AppButton
                                            text="Unload / Receive"
                                            variant="primary"
                                            fullWidth
                                            onClick={() => {
                                                setSelectedOrder(o);
                                                setReceiveOpen(true);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </DeliveryPersonContainer>
                )}

                {!doorStatus && (
                    <DeliveryPersonContainer>
                        <SubHeader text="Incoming Orders" />
                        <Paragraph text="Unlock the rear door to start receiving an order." />
                    </DeliveryPersonContainer>
                )}

                {
                    receiveOpen && (
                        <ReceiveOrderModal
                            open={receiveOpen}
                            onClose={() => setReceiveOpen(false)}
                            userId={String(user?.id ?? "")}
                            order={selectedOrder}
                            onSuccess={() => {
                                showSuccess("Order received", "Stock was added and the order status was updated.");
                                fetchOrders();
                                fetchProducts();
                            }}
                        />
                    )
                }



                {/* viewing the items in the fridge */}
                <TabContainer>
                    <InventoryContainer>
                        {/* heading of the inventory dashboard */}
                        <div className="heading">
                            <div className="tabHeader">
                                <SubHeader
                                    text='Fridge Inventory'
                                    className='font-bold'
                                />
                                <Paragraph
                                    text='Items in Stock'
                                />
                            </div>
                        </div>

                        {/* search functionality */}
                        <div className="itemSearch">
                            <Input
                                type="search"
                                placeholder="Search Items..."
                                icon={<SearchComp />}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                            />
                        </div>

                        {/* items in stock */}
                        <div className="stocksContainer">
                            <div className="scrollable">
                                {/* array product map listing here */}
                                {error && <p style={{ color: "red", marginBottom: 10 }} className="text-sm">{error}</p>}
                                {loading && products.length === 0 && <p className="text-sm">Loading inventory...</p>}

                                {searchInput.trim() === " " && products.map((p) => {
                                    const expiresInDays = daysUntil(p.expiry_date);
                                    const qty = Number(p.qty_total ?? 0);
                                    const min = Number(p.reorder_point ?? 0);
                                    const movement = pickLatestMovement(p);

                                    return (
                                        <ProductCard
                                            key={p.id}
                                            name={p.name}
                                            quantity={qty}
                                            unit={p.unit}
                                            supplier={p.supplier_name ?? "—"}
                                            minStock={min}
                                            activityLabel={movement.label}
                                            activityBy={movement.by}
                                            activityAt={movement.at}              // same
                                            runningLow={min > 0 && qty <= min}
                                            expiresInDays={expiresInDays}
                                            onEdit={() => {
                                                setSelectedIdToEdit(p.id);
                                                setEditItem(true);
                                            }}
                                            onRemove={() => {
                                                setSelectedIdToEdit(p.id);
                                            }}
                                            onButton={false}
                                        />
                                    );
                                })}


                                {visibleProducts.map((p) => {
                                    const expiresInDays = daysUntil(p.expiry_date);
                                    const qty = Number(p.qty_total ?? 0);
                                    const min = Number(p.reorder_point ?? 0);
                                    const movement = pickLatestMovement(p);

                                    return (
                                        <ProductCard
                                            key={p.id}
                                            name={p.name}
                                            quantity={qty}
                                            unit={p.unit}
                                            supplier={p.supplier_name ?? "—"}
                                            minStock={min}
                                            activityLabel={movement.label}
                                            activityBy={movement.by}
                                            activityAt={movement.at}
                                            runningLow={min > 0 && qty <= min}
                                            expiresInDays={expiresInDays}
                                            onEdit={() => {
                                                setSelectedIdToEdit(p.id);
                                                setEditItem(true);
                                            }}
                                            onRemove={() => {
                                                setSelectedIdToEdit(p.id);
                                            }}
                                            onButton={true}
                                        />
                                    );
                                })}

                                {!loading && products.length === 0 && restaurantId && (
                                    <p className="text-sm">No products found for your restaurant.</p>
                                )}

                                {noResults && <p className="text-sm">No results found for {searchQuery}.</p>}

                            </div>
                        </div>
                    </InventoryContainer>
                </TabContainer>
            </PageContainer>

            {/* modal containers */}
            {addItem && (
                <ItemModal
                    title='Add Item to Fridge'
                    description='Enter the details of the item you are adding to the fridge'
                    onClose={() => setAddItem(false)}
                    newItem={true}
                    userId={String(user?.id ?? '')}
                    selectedProduct={null}
                    onSuccess={(itemName) => {
                        showSuccess("Item added", `${itemName ?? "Item"} was added successfully.`);
                        fetchProducts();
                    }}
                />
            )}

            {editItem && (
                <ItemModal
                    title='Edit Item in the Fridge'
                    description='Update the item in the fridge'
                    onClose={() => setEditItem(false)}
                    newItem={false}
                    userId={String(user?.id ?? '')}
                    selectedProduct={selectedProductToEdit}
                    onSuccess={(itemName) => {
                        showSuccess("Item updated", `${itemName ?? "Item"} was updated successfully.`);
                        fetchProducts();
                    }}
                />
            )}

            {successMsg && (
                <MessageSuccess
                    title={successMsg.title}
                    description={successMsg.description}
                />
            )}



            {addItem && <BodyOverlay />}
            {editItem && <BodyOverlay />}
            {successMsg && <BodyOverlay />}
            {receiveOpen && <BodyOverlay />}
        </>
    )
}

