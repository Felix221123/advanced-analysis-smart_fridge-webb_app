import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
    CountContainerBox,
    InventoryContainer,
    TabContainer
} from '@/styles/components/shared.style'
import { SubHeader } from '@/components/SubHeader'
import { Paragraph } from '@/components/Paragraph'
import { AppButton } from '@/components/BaseButton'
import { ItemModal } from '@/components/ItemModal'
import { BodyOverlay } from '@/styles/components/Loading.style'
import { Input } from '@/components/Input'
import SearchIcon from '@/assets/search_icon.svg'
import { ProductCard } from '@/components/ProductCard'
import { CountContainer } from '@/components/CountContainer'
import { DeleteModal } from '@/components/DeleteModal'
import { AllFoodItemProps } from '@/interface/ComponentProps'
import { useAuth } from '@/context/useAuth'
import { AllProducts } from '@/packages/api/ServicesApi'
import { MessageSuccess } from '@/components/MessageModal'
import { daysUntil } from '@/utils/date'


export const PRODUCTS_KEY_PREFIX = "allProducts";

export const readCache = (key: string): AllFoodItemProps[] => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as AllFoodItemProps[]) : [];
    } catch {
        return [];
    }
};

export const writeCache = (key: string, rows: AllFoodItemProps[]) => {
    localStorage.setItem(key, JSON.stringify(rows));
};



export type MovementSummary = {
    label: 'Inserted' | 'Removed' | 'Adjusted' | 'No activity';
    by: string | null;
    at: string | null;
};

export const pickLatestMovement = (p: AllFoodItemProps): MovementSummary => {
    const candidates = [
        { label: 'Inserted' as const, by: p.last_inserted_by, at: p.last_inserted_at },
        { label: 'Removed' as const, by: p.last_removed_by, at: p.last_removed_at },
        { label: 'Adjusted' as const, by: p.last_adjusted_by, at: p.last_adjusted_at },
    ].filter((c) => c.at && !Number.isNaN(new Date(c.at).getTime()));

    if (!candidates.length) {
        return { label: 'No activity', by: null, at: null };
    }

    candidates.sort(
        (a, b) => new Date(b.at as string).getTime() - new Date(a.at as string).getTime()
    );

    const top = candidates[0];
    return { label: top.label, by: top.by ?? null, at: top.at ?? null };
};





export const Inventory: React.FC = () => {
    const { user } = useAuth();

    const [addItem, setAddItem] = useState(false);
    const [removeItem, setRemoveItem] = useState(false);
    const [editItem, setEditItem] = useState(false);
    const [selectedIdToDelete, setSelectedIdToDelete] = useState("");
    const [selectedIdToEdit, setSelectedIdToEdit] = useState("");

    const [products, setProducts] = useState<AllFoodItemProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchInput, setSearchInput] = useState("");
    const restaurantId = user?.restaurant_id ? String(user.restaurant_id) : "";
    const [successMsg, setSuccessMsg] = useState<{ title: string; description: string } | null>(null);
    const [successTimer, setSuccessTimer] = useState<number | null>(null);


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

    const totalItems = products.length;

    const runningLow = products.filter((p) => {
        const min = Number(p.reorder_point ?? 0);
        const qty = Number(p.qty_total ?? 0);
        return min > 0 && qty <= min;
    }).length;


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

    const showSuccess = (title: string, description: string) => {
        if (successTimer) window.clearTimeout(successTimer);
        setSuccessMsg({ title, description });
        const t = window.setTimeout(() => setSuccessMsg(null), 8500);
        setSuccessTimer(t);
    };

    const selectedProductToEdit = useMemo(() => {
        return products.find((p) => String(p.id) === String(selectedIdToEdit)) ?? null;
    }, [products, selectedIdToEdit]);




    return (
        <>
            <CountContainerBox>
                <CountContainer
                    heading='Total Items'
                    figures={String(totalItems)}
                    description='Products in this restaurant'
                />
                <CountContainer
                    heading='Running Low'
                    figures={String(runningLow)}
                    description='At/under reorder point'
                />
            </CountContainerBox>
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
                        {
                            user?.role !== 'CHEF' && (
                                <AppButton
                                    text='+  Add Item'
                                    variant='primary'
                                    onClick={() => { setAddItem(true) }}
                                />
                            )
                        }
                    </div>

                    {/* search functionality */}
                    <div className="itemSearch">
                        <Input
                            type='search'
                            placeholder='Search Items...'
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

                            {/* {searchInput.trim() === "" && products.map((p) => {
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
                                            setSelectedIdToDelete(p.id);
                                            setRemoveItem(true);
                                        }}
                                        onButton={true}
                                    />
                                );
                            })} */}

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
                                            setSelectedIdToDelete(p.id);
                                            setRemoveItem(true);
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


            {removeItem && (
                <DeleteModal
                    container='item'
                    onClose={() => setRemoveItem(false)}
                    targetId={selectedIdToDelete}
                    userId={String(user?.id ?? '')}
                    onSuccess={() => {
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
            {removeItem && <BodyOverlay />}
            {successMsg && <BodyOverlay />}

        </>
    )
}






export const SearchComp: React.FC = () => {
    return (
        <>
            <img src={SearchIcon} alt="search icon" />
        </>
    )
}