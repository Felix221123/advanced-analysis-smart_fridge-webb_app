import React, { useEffect, useMemo, useState } from "react";
import { ModalContainer, ItemModalContainer } from "@/styles/components/Modal.style";
import { SubHeader } from "./SubHeader";
import { Paragraph } from "./Paragraph";
import closeBtn from "@/assets/closeBtn.svg";
import { Input } from "./Input";
import { AppButton } from "./BaseButton";
import { SupplyOrderReadProps } from "@/interface/ApiProps";
import { ReceiveSupplyOrder } from "@/packages/api/OrderApi";


type RowState = {
    qty_delivered: string;
    batch_code: string;
    expiry_date: string;
    produced_at?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    userId: string;
    order: SupplyOrderReadProps | null;
    onSuccess?: () => void;
};

export const ReceiveOrderModal: React.FC<Props> = ({ open, onClose, userId, order, onSuccess }) => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState("");
    const [rows, setRows] = useState<Record<string, RowState>>({});

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const items = order?.items ?? [];

    const remainingByFoodId = useMemo(() => {
        const out: Record<string, number> = {};
        for (const li of items as Array<{ qty_requested?: number | string; qty_delivered?: number | string; food_item_id: string | number }>) {
            const remaining = Math.max(0, Number(li.qty_requested ?? 0) - Number(li.qty_delivered ?? 0));
            out[String(li.food_item_id)] = remaining;
        }
        return out;
    }, [items]);

    useEffect(() => {
        if (!open || !order) return;

        const init: Record<string, RowState> = {};
        for (const li of items) {
            const fid = String(li.food_item_id);
            const remaining = remainingByFoodId[fid] ?? 0;

            init[fid] = {
                qty_delivered: remaining > 0 ? String(remaining) : "",
                batch_code: "",
                expiry_date: "",
                produced_at: "",
            };
        }

        setRows(init);
        setNotes("");
        setError("");
    }, [open, order, items, remainingByFoodId]);

    if (!open || !order) return null;

    const setRow = (foodItemId: string, patch: Partial<RowState>) => {
        setRows((prev) => ({ ...prev, [foodItemId]: { ...prev[foodItemId], ...patch } }));
    };

    const handleSubmit = async () => {
        setError("");

        // Build payload lines (skip blank qty)
        const payloadItems = items
            .map((li) => {
                const fid = String(li.food_item_id);
                const r = rows[fid];
                const qty = Number(r?.qty_delivered ?? 0);

                if (!qty || qty <= 0) return null;

                if (!r.batch_code?.trim()) return { err: `Batch code required for ${li.food_item_name}` };
                if (!r.expiry_date) return { err: `Expiry date required for ${li.food_item_name}` };

                // optional: don’t let them exceed remaining (still allow partial)
                const remaining = remainingByFoodId[fid] ?? 0;
                if (qty > remaining) return { err: `Qty for ${li.food_item_name} cannot exceed remaining (${remaining}).` };

                return {
                    food_item_id: fid,
                    qty_delivered: qty,
                    batch_code: r.batch_code.trim(),
                    expiry_date: r.expiry_date,
                    produced_at: r.produced_at ? r.produced_at : null,
                };
            })
            .filter(Boolean) as any[];

        const errObj = payloadItems.find((x: any) => x?.err);
        if (errObj?.err) {
            setError(errObj.err);
            return;
        }

        if (!payloadItems.length) {
            setError("Enter at least one delivered quantity.");
            return;
        }

        try {
            setLoading(true);

            await ReceiveSupplyOrder({
                user_id: userId,
                supply_order_id: String(order.id),
                fridge_id: null,
                notes: notes || null,
                items: payloadItems,
            });

            onSuccess?.();
            onClose();
        } catch (e: any) {
            setError(e?.detail || e?.message || "Could not receive this order.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalContainer>
            <ItemModalContainer>
                <div className="container">
                    <div className="heading">
                        <SubHeader text={`Receive Order • ${order.supplier_name ?? "Supplier"}`} className="text-left" />
                        <img src={closeBtn} alt="close" onClick={onClose} className="cursor-pointer" />
                    </div>

                    <Paragraph text={`Status: ${order.status}`} className="text-left" />
                    {error && <Paragraph text={error} className="text-left" />}
                </div>

                <div className="form_container">
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                        <AppButton
                            text="Fill Remaining"
                            variant="outline"
                            fullWidth
                            type="button"
                            onClick={() => {
                                // fill remaining quantities for all lines
                                const next = { ...rows };
                                for (const li of items) {
                                    const fid = String(li.food_item_id);
                                    next[fid] = {
                                        ...next[fid],
                                        qty_delivered: String(remainingByFoodId[fid] ?? 0),
                                    };
                                }
                                setRows(next);
                            }}
                        />
                        <AppButton
                            text="Clear Quantities"
                            variant="outline"
                            fullWidth
                            type="button"
                            onClick={() => {
                                const next = { ...rows };
                                for (const li of items) {
                                    const fid = String(li.food_item_id);
                                    next[fid] = { ...next[fid], qty_delivered: "" };
                                }
                                setRows(next);
                            }}
                        />
                    </div>

                    {items.map((li) => {
                        const fid = String(li.food_item_id);
                        const remaining = remainingByFoodId[fid] ?? 0;
                        const r = rows[fid];

                        return (
                            <div key={fid} style={{ padding: 12, border: "1px solid #eee", borderRadius: 10, marginBottom: 10 }}>
                                <Paragraph text={li.food_item_name ?? "Item"} className="text-left font-bold" />
                                <Paragraph
                                    text={`Requested: ${li.qty_requested} • Delivered: ${li.qty_delivered} • Remaining: ${remaining}`}
                                    className="text-left"
                                />

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                                    <div className="form-group">
                                        <div className="container">
                                            <Paragraph text="Item Quantity" className='text-left font-bold' />
                                            <Input
                                                id={`qty_${fid}`}
                                                type="number"
                                                placeholder={remaining > 0 ? `Max ${remaining}` : "0"}
                                                className='text-left'
                                                value={r?.qty_delivered ?? ""}
                                                onChange={(e: any) => setRow(fid, { qty_delivered: e.target.value })}
                                            />
                                        </div>

                                        <div className="container">
                                            <Paragraph text="Batch Code" className='text-left font-bold' />
                                            <Input
                                                id={`batch_${fid}`}
                                                type="text"
                                                placeholder="Batch code"
                                                className='text-left'
                                                value={r?.batch_code ?? ""}
                                                onChange={(e: any) => setRow(fid, { batch_code: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <div className="container">
                                            <Paragraph text="Expiry Date" className='text-left font-bold' />
                                            <Input
                                                id={`exp_${fid}`}
                                                type="date"
                                                placeholder={remaining > 0 ? `Max ${remaining}` : "0"}
                                                className='text-left'
                                                value={r?.expiry_date ?? ""}
                                                onChange={(e: any) => setRow(fid, { expiry_date: e.target.value })}
                                            />
                                        </div>

                                        <div className="container">
                                            <Paragraph text="Produced At" className='text-left font-bold' />
                                            <Input
                                                id={`prod_${fid}`}
                                                type="date"
                                                placeholder="Produced at (optional)"
                                                className='text-left'
                                                value={r?.produced_at ?? ""}
                                                onChange={(e: any) => setRow(fid, { produced_at: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div className="form-group" style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        <Paragraph text="Delivery Notes (optional)" className="text-left font-bold" />
                        <Input
                            id="notes"
                            type="text"
                            placeholder="eg Left at rear entrance, boxes intact..."
                            value={notes}
                            onChange={(e: any) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="form_buttons" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <AppButton text="Cancel" onClick={onClose} variant="outline" fullWidth type="button" />
                        <AppButton
                            text={loading ? "Receiving..." : "Confirm Receive"}
                            onClick={handleSubmit}
                            variant="primary"
                            fullWidth
                            type="button"
                        />
                    </div>
                </div>
            </ItemModalContainer>
        </ModalContainer>
    );
};
