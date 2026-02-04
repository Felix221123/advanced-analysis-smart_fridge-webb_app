// component props
import { CreateUserProps } from "./UserProps";



export interface ButtonProps {
    text: string
    onClick?: () => void
    className?: string
    type?: "button" | "reset" | "submit";
    disabled?: boolean
}


// text component props
export interface TextProps {
    text: string | undefined
    className?: string
}

// modal for users
export interface UserModalProps {
    title: string
    description: string
    onClose: () => void
    newUser: boolean
    onSuccess?: () => void

    selectedUserId?: string;
    initialValues?: Partial<CreateUserProps>;
}

// modal for items
export interface ItemModalProps {
    title: string
    description: string
    onClose: () => void
    newItem: boolean

    userId: string;
    selectedProduct?: AllFoodItemProps | null;
    onSuccess?: (itemName?: string) => void;
}


// product card
export interface ProductCardProps {
    name: string;
    quantity: number;
    unit: string;
    supplier: string;
    minStock: number;
    activityLabel?: 'Inserted' | 'Removed' | 'Adjusted' | 'No activity';
    activityBy?: string | null;
    activityAt?: string | Date | null;
    unlock_items?: boolean

    // Status badges
    runningLow?: boolean;
    expiresInDays?: number | null;

    // Button callbacks
    onEdit?: () => void;
    onRemove?: () => void;

    onButton: boolean
}

// product card on stock container
export interface StockContainerProductCardProps {
    name: string;
    quantity: number;
    supplier: string;
    expiryDate: string;
    expiresInDays?: number | null;
    minStock: number;
    currentStock?: number | null
    unit: string;

    container: 'expiringSoon' | 'lowStockItems' | 'complianceItems' | 'expired',
}


export interface ReorderStockContainerProps {
    name: string;
    supplier: string;
    minStock: number;
    currentStock: number;
    unit: string;

    ordered?: boolean;
    orderStatus?: string;
    orderedFrom?: string;
    qtyRequested?: number;
    qtyDelivered?: number;
}


export interface AllFoodItemProps {
    id: string;
    restaurant_id: string;
    name: string;
    unit: string;
    pack_size: number;
    shelf_life_days: number;
    allergens?: string | null;
    reorder_point: number;
    reorder_qty: number;
    notes?: string | null;
    default_supplier_id?: string | null;

    supplier_id?: string | null;
    supplier_name?: string | null;
    price_per_unit?: number | null;

    qty_total: number;
    expiry_date: string | null;

    // / new for edit
    item_batch_id?: string | null;
    batch_code?: string | null;

    last_inserted_by?: string | null;
    last_inserted_at?: string | null;
    last_removed_by?: string | null;
    last_removed_at?: string | null;
    last_adjusted_by?: string | null;
    last_adjusted_at?: string | null;

    is_active: boolean;
}



export interface EditFoodItemProps {
    user_id: string;
    food_item_id: string;

    name?: string;
    unit?: string;
    pack_size?: number;
    shelf_life_days?: number;
    allergens?: string | null;
    reorder_point?: number;
    reorder_qty?: number;
    notes?: string | null;
    default_supplier_id?: string | null


    item_batch_id?: string | null;
    new_qty?: number | null;     // set quantity
    delta_qty?: number | null;   // or change by +/- amount

    reason?: string;
}


export interface CreateFoodItemProps {
    user_id: string;

    name: string;
    unit: string;
    pack_size: number;
    shelf_life_days: number;
    allergens?: string | null;
    reorder_point: number;
    reorder_qty: number;
    notes?: string | null;

    supplier_id?: string | null;
    price_per_unit?: number | null;
    is_primary?: boolean;

    batch_code: string;
    expiry_date: string;      // yyyy-mm-dd
    produced_at?: string;     // yyyy-mm-dd
    qty_initial: number;

    reason?: string;
}


