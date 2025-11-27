// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";

interface User {
    id: string;
    email: string;
    role: string;
}

export interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("appUser");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    const login = (user: User) => {
        setUser(user);
        localStorage.setItem("appUser", JSON.stringify(user));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("appUser");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
