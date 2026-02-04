export interface GenerateOrdersResponseProps {
    created_orders: [
        {
            id: string,
            restaurant_id: string,
            supplier_id: string,
            supplier_name: string,
            created_by_user_id: string,
            status: string,
            created_at: string,
            sent_at: string | null,
            delivered_at: string | null,
            notes: string,
            items: [
                {
                    id: string,
                    food_item_id: string,
                    food_item_name: string,
                    qty_requested: number,
                    qty_delivered: number,
                    unit_price: number
                }
            ]
        }
    ],
    skipped_items_missing_supplier: []
}



export interface GenerateOrdersRequestProps {
    user_id: string,
    notes: string
}


export interface OrderReceivedRequestProps {
    user_id: string,
    supply_order_id: string,
    fridge_id: string,
    notes: string | null,
    items: [
        {
            food_item_id: string,
            qty_delivered: number,
            batch_code: string,
            expiry_date: string,
            produced_at: string | null
        }
    ]
}


export interface OrderReceivedResponseProps {
    status: string,
    supply_order_id: string,
    order_status: string,
    delivery_id: string
}

export interface SupplyOrderReadProps {
    id: string,
    restaurant_id: string,
    supplier_id: string,
    supplier_name: string,
    created_by_user_id: string,
    status: string,
    created_at: string,
    sent_at: string,
    delivered_at: string,
    notes: string,
    items: SupplyItems[]
}

export interface SupplyItems {
    id: string,
    food_item_id: string,
    food_item_name: string
    qty_requested: number
    qty_delivered: number
    unit_price: string
}