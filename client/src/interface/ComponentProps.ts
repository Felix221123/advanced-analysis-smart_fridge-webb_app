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
}


// product card
export interface ProductCardProps {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    supplier: string;
    minStock: number;
    addedBy: string;
    addedAt: string | Date;

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
    category: string;
    supplier: string;
    expiryDate: string | Date;
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
    currentStock?: number | null
    unit: string;
}