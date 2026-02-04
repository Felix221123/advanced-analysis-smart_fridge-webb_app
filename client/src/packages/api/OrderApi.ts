import { FetchData } from "../fetch_manager/FetchManager";
import {
    GenerateOrdersResponseProps,
    GenerateOrdersRequestProps,
    SupplyOrderReadProps
} from "@/interface/ApiProps";

const Port = "http://127.0.0.1:8000";



export const GenerateOrdersForLowStock = async (
    props: GenerateOrdersRequestProps
): Promise<GenerateOrdersResponseProps> => {
    const url = `${Port}/service/supply_orders/generate`;

    const { user_id, notes } = props;

    const res = await FetchData(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id, notes }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw err;
    }

    return res.json();
};


export const MarkSupplyOrderSent = async (props: {
    user_id: string;
    supply_order_id: string;
}) => {
    const url = `${Port}/service/supply_orders/${props.supply_order_id}/send`;

    const res = await FetchData(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: props.user_id }),
    });

    if (!res.ok) throw await res.json();
    return res.json();
};


export const ListSupplyOrders = async (props: { user_id: string; status?: string[] }): Promise<SupplyOrderReadProps[]> => {
    const qs = new URLSearchParams({ user_id: props.user_id });
    (props.status ?? []).forEach((s) => qs.append("status", s));

    const url = `${Port}/service/supply_orders?${qs.toString()}`;

    const res = await FetchData(url, { method: "GET", credentials: "include" });
    if (!res.ok) throw await res.json();
    return res.json();
};

export const ReceiveSupplyOrder = async (props: {
    user_id: string;
    supply_order_id: string;
    fridge_id?: string | null;
    notes?: string | null;
    items: { food_item_id: string; qty_delivered: number; batch_code: string; expiry_date: string; produced_at?: string | null }[];
}) => {
    const url = `${Port}/service/supply_orders/${props.supply_order_id}/receive`;

    const res = await FetchData(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            user_id: props.user_id,
            fridge_id: props.fridge_id ?? null,
            notes: props.notes ?? null,
            items: props.items,
        }),
    });

    if (!res.ok) throw await res.json();
    return res.json();
};


export const GetRearDoorStatus = async (user_id: string) => {
    const url = `${Port}/service/door_status/rear?user_id=${user_id}`;
    const res = await FetchData(url, { method: "GET", credentials: "include" });
    if (!res.ok) throw await res.json();
    return res.json();
};

export const DoorAccess = async (payload: {
    user_id: string;
    door_type: "REAR";
    set_locked: boolean;
    method?: string;
    reason?: string | null;
}) => {
    const url = `${Port}/service/door_access`;
    const res = await FetchData(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            user_id: payload.user_id,
            door_type: payload.door_type,
            set_locked: payload.set_locked,
            method: payload.method ?? "app",
            reason: payload.reason ?? null,
            success: true,
        }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
};
