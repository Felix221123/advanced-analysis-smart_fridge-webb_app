import React, { useState, useEffect } from 'react'
import {
    ModalContainer,
    ItemModalContainer
} from '@/styles/components/Modal.style'
import { SubHeader } from './SubHeader'
import { Paragraph } from './Paragraph'
import closeBtn from '@/assets/closeBtn.svg'
import { ItemModalProps } from '@/interface/ComponentProps'
import { Input } from './Input'
import { AppButton } from './BaseButton'
import CustomSelect from './CustomSelect'
import { CreateFoodItemProps, EditFoodItemProps, AllFoodItemProps } from '@/interface/ComponentProps'
import { CreateFoodItemApi, UpdateFoodItemApi, AllProducts } from '@/packages/api/ServicesApi'
import { useAuth } from '@/context/useAuth'




export const ItemModal: React.FC<ItemModalProps> = (
    { title, description, onClose, newItem, userId, selectedProduct, onSuccess }
) => {
    const { user } = useAuth();
    type SupplierOption = { id: string; name: string };


    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [name, setName] = useState('')
    const [batchCode, setBatchCode] = useState('')
    const [qty, setQty] = useState('')

    const [unit, setUnit] = useState('')
    const [packSize, setPackSize] = useState('')
    const [shelfLifeDays, setShelfLifeDays] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [producedAt, setProducedAt] = useState('')
    const [reorderPoint, setReorderPoint] = useState('')
    const [reorderQty, setReorderQty] = useState('')
    const [allergens, setAllergens] = useState('')
    const [notes, setNotes] = useState('')
    const restaurantId = user?.restaurant_id ? String(user.restaurant_id) : "";

    const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([]);
    const [supplierId, setSupplierId] = useState<string>("");
    const [pricePerUnit, setPricePerUnit] = useState<string>("");

    useEffect(() => {
        if (!newItem && selectedProduct) {
            setName(selectedProduct.name || '')
            setUnit(selectedProduct.unit || '')
            setPackSize(String(selectedProduct.pack_size ?? ''))
            setShelfLifeDays(String(selectedProduct.shelf_life_days ?? ''))
            setExpiryDate(selectedProduct.expiry_date ? String(selectedProduct.expiry_date).slice(0, 10) : '')
            setBatchCode(selectedProduct.batch_code || '')
            setReorderPoint(String(selectedProduct.reorder_point ?? ''))
            setReorderQty(String(selectedProduct.reorder_qty ?? ''))
            setAllergens(selectedProduct.allergens || '')
            setNotes(selectedProduct.notes || '')
            setQty('') // only used if user wants to set new stock qty
            setProducedAt('') // backend doesn’t update batch fields in edit mode
            setSupplierId(selectedProduct.supplier_id ? String(selectedProduct.supplier_id) : "");
            setPricePerUnit(
                selectedProduct.price_per_unit != null ? String(selectedProduct.price_per_unit) : ""
            );
        }
    }, [newItem, selectedProduct])

    useEffect(() => {
        const loadSuppliersFromProducts = async () => {
            if (!restaurantId) return;

            try {
                const res = await AllProducts();

                const filtered = Array.isArray(res)
                    ? res.filter((p: AllFoodItemProps) => String(p.restaurant_id) === restaurantId)
                    : [];

                // dedupe by supplier_id (skip nulls)
                const map = new Map<string, string>();
                for (const p of filtered) {
                    const id = p.supplier_id ? String(p.supplier_id) : "";
                    const name = (p.supplier_name ?? "").trim();

                    if (id && name && !map.has(id)) {
                        map.set(id, name);
                    }
                }

                const opts: SupplierOption[] = Array.from(map.entries())
                    .map(([id, name]) => ({ id, name }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setSupplierOptions(opts);
            } catch {
                // optional: you can set an error or just keep empty options
                setSupplierOptions([]);
            }
        };

        loadSuppliersFromProducts();
    }, [restaurantId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!userId) {
            setError("Missing user id.")
            return
        }

        try {
            setLoading(true)

            if (supplierId && newItem && !pricePerUnit) {
                const payload: CreateFoodItemProps = {
                    user_id: userId,
                    name: name.trim(),
                    unit: unit.trim(),
                    pack_size: Number(packSize),
                    shelf_life_days: Number(shelfLifeDays),
                    allergens: allergens || null,
                    reorder_point: Number(reorderPoint),
                    reorder_qty: Number(reorderQty),
                    notes: notes || null,

                    supplier_id: supplierId || null,
                    price_per_unit: supplierId ? Number(pricePerUnit) : null,
                    is_primary: supplierId ? true : undefined,

                    batch_code: batchCode.trim(),
                    expiry_date: expiryDate,
                    produced_at: producedAt || undefined,
                    qty_initial: Number(qty),
                }


                const created: AllFoodItemProps = await CreateFoodItemApi(payload)
                onSuccess?.(created?.name || "Item")
            } else {
                if (!selectedProduct) throw new Error('No product selected for editing.')

                const editPayload: EditFoodItemProps = {
                    user_id: userId,
                    food_item_id: selectedProduct.id,

                    name: name.trim(),
                    unit: unit.trim(),
                    pack_size: Number(packSize),
                    shelf_life_days: Number(shelfLifeDays),
                    allergens: allergens || null,
                    reorder_point: Number(reorderPoint),
                    reorder_qty: Number(reorderQty),
                    notes: notes || null,

                    item_batch_id: selectedProduct.item_batch_id || null,
                    new_qty: qty ? Number(qty) : null,

                    // set default supplier (no price required)
                    default_supplier_id: supplierId || null,

                    // update supplier link ONLY if price provided (avoids backend validation error)
                    ...(supplierId && pricePerUnit
                        ? {
                            supplier_id: supplierId,
                            price_per_unit: Number(pricePerUnit),
                            is_primary: true,
                        }
                        : {}),
                };


                const updated: AllFoodItemProps = await UpdateFoodItemApi(editPayload)
                onSuccess?.(updated?.name || "Item")
            }

            onClose()
        } catch (err: any) {
            setError(err?.detail || err?.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    const readOnlyBatchFields = !newItem



    return (
        <ModalContainer>
            <ItemModalContainer>
                <div className="container">
                    <div className="heading" data-testid='heading'>
                        <SubHeader text={title} className='text-left' />
                        <img src={closeBtn} alt="close" onClick={onClose} className='cursor-pointer' />
                    </div>
                    <div className="content">
                        <Paragraph text={description} className='text-left' />
                    </div>
                </div>

                <div className="form_container">
                    <form onSubmit={handleSubmit}>
                        {error && <Paragraph text={error} className="text-left" />}

                        <div className="form-group">
                            <Paragraph text="Item Name" className='text-left font-bold' />
                            <Input
                                id="name"
                                type="text"
                                placeholder="eg. Chicken Breast"
                                className='text-left'
                                required={true}
                                value={name}
                                onChange={(e: any) => setName(e.target.value)}
                                data-testid="itemName"
                            />
                        </div>

                        <div className="form-group">
                            <div className="container">
                                <Paragraph text="Batch Code" className='text-left font-bold' />
                                <Input
                                    id="batch_code"
                                    type="text"
                                    placeholder="eg. B2 ...."
                                    className='text-left'
                                    required={newItem}
                                    value={batchCode}
                                    onChange={(e: any) => setBatchCode(e.target.value)}
                                    readOnly={readOnlyBatchFields}
                                />
                            </div>

                            <div className="container">
                                <Paragraph text="Quantity" className='text-left font-bold' />
                                <Input
                                    id="quantity"
                                    type="number"
                                    placeholder={newItem ? "0.00" : "Leave empty to keep stock unchanged"}
                                    className='text-left'
                                    required={newItem}
                                    value={qty}
                                    onChange={(e: any) => setQty(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="container">
                                <Paragraph text="Unit" className='text-left font-bold' />
                                <Input
                                    id="unit"
                                    type="text"
                                    placeholder="kg"
                                    className='text-left'
                                    required={true}
                                    value={unit}
                                    onChange={(e: any) => setUnit(e.target.value)}
                                />
                            </div>

                            <div className="container">
                                <Paragraph text="Pack Size" className='text-left font-bold' />
                                <Input
                                    id="pack_size"
                                    type="number"
                                    placeholder="eg 1"
                                    className='text-left'
                                    required={true}
                                    value={packSize}
                                    onChange={(e: any) => setPackSize(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="container">
                                <Paragraph text="Shelf Life Days" className='text-left font-bold' />
                                <Input
                                    id="shelf_life_days"
                                    type="number"
                                    placeholder="eg 7"
                                    className='text-left'
                                    required={true}
                                    value={shelfLifeDays}
                                    onChange={(e: any) => setShelfLifeDays(e.target.value)}
                                />
                            </div>

                            <div className="container">
                                <Paragraph text="Expiry Date" className='text-left font-bold' />
                                <Input
                                    id="expiry_date"
                                    type="date"
                                    className='text-left'
                                    required={newItem}
                                    value={expiryDate}
                                    onChange={(e: any) => setExpiryDate(e.target.value)}
                                    readOnly={readOnlyBatchFields}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="container">
                                <Paragraph text="Produced At" className='text-left font-bold' />
                                <Input
                                    id="produced_at"
                                    type="date"
                                    className='text-left'
                                    required={false}
                                    value={producedAt}
                                    onChange={(e: any) => setProducedAt(e.target.value)}
                                    readOnly={readOnlyBatchFields}
                                />
                            </div>

                            <div className="container">
                                <Paragraph text="Minimum Quantity" className='text-left font-bold' />
                                <Input
                                    id="reorder_point"
                                    type="number"
                                    placeholder="0"
                                    className='text-left'
                                    required={true}
                                    value={reorderPoint}
                                    onChange={(e: any) => setReorderPoint(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="container">
                                <Paragraph text="Reorder Quantity" className='text-left font-bold' />
                                <Input
                                    id="reorder_qty"
                                    type="number"
                                    placeholder="0"
                                    className='text-left'
                                    required={true}
                                    value={reorderQty}
                                    onChange={(e: any) => setReorderQty(e.target.value)}
                                />
                            </div>

                            <div className="container">
                                <Paragraph text="Allergens" className='text-left font-bold' />
                                <Input
                                    id="allergens"
                                    type="text"
                                    placeholder="eg Dairy"
                                    className='text-left'
                                    required={false}
                                    value={allergens}
                                    onChange={(e: any) => setAllergens(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">

                            <div className="container">
                                <Paragraph text="Price per Unit" className="text-left font-bold" />
                                <Input
                                    id="price_per_unit"
                                    type="number"
                                    placeholder="eg 6.20"
                                    className="text-left"
                                    required={newItem} // required on create if supplier selected
                                    value={pricePerUnit}
                                    onChange={(e: any) => setPricePerUnit(e.target.value)}
                                />
                            </div>

                            <div className="container">
                                <Paragraph text="Supplier" className="text-left font-bold" />

                                <CustomSelect
                                    value={supplierId}
                                    onChange={(e: any) => setSupplierId(e.target.value)}
                                >
                                    <option value="">Select Supplier</option>

                                    {supplierOptions.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </CustomSelect>
                            </div>

                        </div>
                        <div className="form-group">
                            <div className="container">
                                <Paragraph text="Notes" className='text-left font-bold' />
                                <Input
                                    id="notes"
                                    type="text"
                                    placeholder="eg Keep it in the fridge at 2°C"
                                    className='text-left'
                                    required={false}
                                    value={notes}
                                    onChange={(e: any) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form_buttons">
                            <AppButton text="Cancel" onClick={onClose} variant='outline' fullWidth={true} type="button" />
                            <AppButton
                                text={newItem ? (loading ? 'Adding...' : 'Add Item') : (loading ? 'Updating...' : 'Update Item')}
                                variant="primary"
                                fullWidth={true}
                                type="submit"
                            />
                        </div>
                    </form>
                </div>
            </ItemModalContainer>
        </ModalContainer>
    )
}

