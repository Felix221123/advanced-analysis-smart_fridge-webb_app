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