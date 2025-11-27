import { AuthContextType, AuthContext } from "./AuthContext";
import { useContext } from "react";

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};