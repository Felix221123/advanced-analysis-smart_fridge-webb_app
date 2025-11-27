import React from 'react'
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Loading } from '@/components/Loading';

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <Loading />;
    if (!user ) return <Navigate to="/login" replace />;

    return <>{children}</>;
};
