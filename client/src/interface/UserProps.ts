// user props 
export interface LoginRequestProps {
    email: string;
    password: string;
}

export interface LoginResponseProps {
    id: string;
    full_name: string;
    email: string;
    role: string;
    restaurant_id: string;
    is_active: boolean
}

export interface UserCardProps {
    id?: string;
    full_name?: string;
    email?: string;
    role?: string;
    is_active?: string;

    onEdit?: () => void;
    onRemove?: () => void;
}

export interface CreateUserProps {
    full_name: string,
    email: string,
    role: string,
    is_active: boolean,
    restaurant_id: string,
    password: string
}

export interface CreateUserResponse {
    full_name: string,
    email: string,
    role: string,
    is_active: boolean,
    id: string,
    restaurant_id: string,
    created_at: string
}


export interface AllUsersProp {
    id: string;
    full_name: string;
    email: string;
    role: string;
    restaurant_id: string;
    is_active: boolean;
}[]

export interface UpdateUserProp {
    userId: string;
    user?: {
        full_name: string | null,
        email: string | null,
        role: string | null,
        is_active: boolean | null,
        restaurant_id: string | null,
        password: string | null
    }
}

